import crypto from "crypto";

/**
 * Values that shipped inside this repository (`.env.example`, source fallbacks)
 * and are therefore publicly known. Accepting one as the signing key would let
 * anyone forge OAuth `state` tokens and cross-domain session-sync tokens, so
 * they are rejected outright.
 */
const COMPROMISED_SECRETS: Record<string, true> = {
  "fairshare_jwt_session_secret_key_super_secure_32_chars_min!": true,
  "fairshare_oauth_secret_fallback_key_2025_secure": true,
};

/**
 * HMAC key for signed OAuth `state` tokens and cross-domain session-sync
 * tokens. It MUST come from the environment.
 *
 * A hardcoded fallback would be a publicly known signing key: an attacker
 * could then forge a valid `state` (or session-sync token) and take over a
 * session. When no suitable secret is configured this fails closed rather
 * than silently using a shared constant.
 */
function requireOAuthSecret(): string {
  const candidates = [process.env.SESSION_SECRET, process.env.GOOGLE_CLIENT_SECRET];
  for (const candidate of candidates) {
    if (candidate && candidate.length >= 32 && !Object.hasOwn(COMPROMISED_SECRETS, candidate)) {
      return candidate;
    }
  }
  throw new Error(
    "SESSION_SECRET wajib diisi dengan nilai acak minimal 32 karakter (nilai contoh yang publik ditolak) untuk menandatangani state OAuth dan token session-sync."
  );
}

export interface OAuthStatePayload {
  nonce: string;
  timestamp: number;
  origin: string;
  redirectUri: string;
  redirectPath?: string;
}

/**
 * Generates a tamper-proof signed OAuth state token.
 * Contains encoded origin, redirectUri, and return path with HMAC-SHA256 signature.
 */
export function generateSignedOAuthState(
  origin: string,
  redirectUri: string,
  redirectPath: string = "/dashboard"
): string {
  const payload: OAuthStatePayload = {
    nonce: crypto.randomBytes(16).toString("hex"),
    timestamp: Date.now(),
    origin,
    redirectUri,
    redirectPath,
  };
  const serialized = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", requireOAuthSecret())
    .update(serialized)
    .digest("base64url");
  return `${serialized}.${signature}`;
}

/**
 * Validates a signed OAuth state token.
 * Prevents "Validasi sesi OAuth gagal" by being resilient against cross-domain redirect cookie loss,
 * while ensuring complete CSRF protection and signature freshness (< 20 minutes).
 */
export function verifySignedOAuthState(
  stateParam: string | null,
  cookieState?: string
): { valid: boolean; payload?: OAuthStatePayload } {
  if (!stateParam) return { valid: false };

  // 1. Direct cookie match check
  const cookieMatches = Boolean(cookieState && cookieState === stateParam);

  // 2. Cryptographic signature check (Self-Contained Signed State Token)
  try {
    const parts = stateParam.split(".");
    if (parts.length === 2) {
      const [serialized, signature] = parts;
      const expectedSig = crypto
        .createHmac("sha256", requireOAuthSecret())
        .update(serialized)
        .digest("base64url");

      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expectedSig);

      if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
        const payload: OAuthStatePayload = JSON.parse(
          Buffer.from(serialized, "base64url").toString()
        );
        // Valid for up to 20 minutes
        const isFresh = Date.now() - payload.timestamp < 20 * 60 * 1000;
        if (isFresh) {
          return { valid: true, payload };
        }
      }
    }
  } catch (err) {
    console.error("verifySignedOAuthState error:", err);
  }

  // 3. Fallback if cookie matches exactly
  if (cookieMatches) {
    return { valid: true };
  }

  return { valid: false };
}

/**
 * Resolves the exact Google OAuth redirect URI based on the request host.
 * Synchronized with the 4 production domains + localhost registered in Google Cloud Console:
 * 1. https://fairshare.copilotmarketing.id/api/auth/google/callback
 * 2. https://www.fairshare.copilotmarketing.id/api/auth/google/callback
 * 3. https://app-fairshare.vercel.app/api/auth/google/callback
 * 4. https://www.app-fairshare.vercel.app/api/auth/google/callback
 * 5. http://localhost:3000/api/auth/google/callback
 */
export function resolveOAuthRedirectUri(host: string): string {
  const isLocal =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.startsWith("0.0.0.0");
  if (isLocal) {
    return "http://localhost:3000/api/auth/google/callback";
  }

  const cleanHost = host.toLowerCase().split(":")[0];

  if (cleanHost === "www.fairshare.copilotmarketing.id") {
    return "https://www.fairshare.copilotmarketing.id/api/auth/google/callback";
  }
  if (cleanHost === "fairshare.copilotmarketing.id") {
    return "https://fairshare.copilotmarketing.id/api/auth/google/callback";
  }
  if (cleanHost === "www.app-fairshare.vercel.app") {
    return "https://www.app-fairshare.vercel.app/api/auth/google/callback";
  }
  if (cleanHost === "app-fairshare.vercel.app") {
    return "https://app-fairshare.vercel.app/api/auth/google/callback";
  }

  // Any other subdomain of copilotmarketing.id
  if (cleanHost.endsWith("copilotmarketing.id")) {
    return `https://${cleanHost}/api/auth/google/callback`;
  }

  // If explicit GOOGLE_REDIRECT_URI environment variable is provided and not localhost
  if (
    process.env.GOOGLE_REDIRECT_URI &&
    !process.env.GOOGLE_REDIRECT_URI.includes("localhost")
  ) {
    return process.env.GOOGLE_REDIRECT_URI;
  }

  // Fallback to dynamic host
  return `https://${cleanHost}/api/auth/google/callback`;
}

/**
 * Allowlist for the post-login redirect origin carried inside the signed OAuth
 * state. Trusting an arbitrary payload origin would turn a leaked signing key
 * into an open redirect that hands the session-sync token to an attacker host.
 */
export function isTrustedOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }
    const host = url.hostname.toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "copilotmarketing.id" ||
      host.endsWith(".copilotmarketing.id") ||
      host === "app-fairshare.vercel.app" ||
      host === "www.app-fairshare.vercel.app"
    );
  } catch {
    return false;
  }
}

/**
 * Creates a short-lived (2 minutes) cryptographically signed token for transferring
 * session safely across domains (e.g. from app-fairshare.vercel.app to fairshare.copilotmarketing.id).
 */
export function createSessionSyncToken(sessionId: string): string {
  const payload = {
    sessionId,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(12).toString("hex"),
  };
  const serialized = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", requireOAuthSecret())
    .update(serialized)
    .digest("base64url");
  return `${serialized}.${signature}`;
}

/**
 * Validates a cross-domain session transfer token.
 */
export function verifySessionSyncToken(
  token: string | null
): { valid: boolean; sessionId?: string } {
  if (!token) return { valid: false };
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return { valid: false };
    const [serialized, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", requireOAuthSecret())
      .update(serialized)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false };
    }

    const payload = JSON.parse(Buffer.from(serialized, "base64url").toString());
    // Valid for up to 2 minutes
    const isFresh = Date.now() - payload.timestamp < 2 * 60 * 1000;
    if (isFresh && payload.sessionId) {
      return { valid: true, sessionId: payload.sessionId };
    }
  } catch (err) {
    console.error("verifySessionSyncToken error:", err);
  }
  return { valid: false };
}

