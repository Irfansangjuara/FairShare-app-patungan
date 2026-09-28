import { db } from "../../db/index.ts";
import { apiTokens, users } from "../../db/schema.ts";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { rateLimit } from "../rate-limit.ts";
import { API_SCOPE_VALUES, type ApiScope } from "../scopes.ts";

export type RequestWithHeaders = Request | { headers: { get(name: string): string | null } };

export type { ApiScope };
export { API_SCOPE_VALUES, USER_ASSIGNABLE_SCOPES, ADMIN_ONLY_SCOPES } from "../scopes.ts";

/**
 * Optional official AI-agent token, supplied ONLY through the environment.
 *
 * Never hardcode this value: a token committed to the repository is a
 * permanent, publicly known administrator backdoor. When
 * `FAIRSHARE_AGENT_TOKEN` is unset there is no official agent token at all.
 */
export const OFFICIAL_AI_AGENT_TOKEN = process.env.FAIRSHARE_AGENT_TOKEN?.trim() || null;

export const OFFICIAL_AI_AGENT_SCOPES: ApiScope[] = [
  "admin:manage",
  "articles:read",
  "articles:write",
  "read:campaigns",
  "write:expenses",
  "read:settlements",
  "write:settlements",
];

export interface AuthResult {
  authorized: boolean;
  status?: number;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
  tokenId?: string;
  tokenScopes?: string[];
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateTokenSecret(): { rawToken: string; tokenHash: string; tokenPrefix: string } {
  const randomBytes = crypto.randomBytes(24).toString("hex");
  const rawToken = `fs_live_${randomBytes}`;
  const tokenHash = hashToken(rawToken);
  const tokenPrefix = `fs_live_${randomBytes.slice(0, 8)}`;
  return { rawToken, tokenHash, tokenPrefix };
}

/**
 * Fixed-window limiter keyed by token id: 120 requests/minute.
 * Delegates to the shared process-local limiter.
 */
export function checkRateLimit(
  tokenId: string,
  limit = 120,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const result = rateLimit(`api-token:${tokenId}`, limit, windowMs);
  return { allowed: result.allowed, remaining: result.remaining };
}

/**
 * Verifies the `Authorization: Bearer fs_live_...` header for the public API.
 *
 * When a token is valid but lacks `requiredScope`, this returns
 * `authorized: false` **with `user` and `tokenScopes` populated** so callers can
 * implement documented OR-semantics (e.g. `admin:manage` also permits article
 * writes). When the token itself is invalid, `user` is undefined.
 */
export async function verifyApiRequest(
  req: RequestWithHeaders,
  requiredScope?: ApiScope | ApiScope[]
): Promise<AuthResult> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authorized: false,
      status: 401,
      error: "Otorisasi Bearer Token diperlukan. Sertakan header 'Authorization: Bearer fs_live_...'",
    };
  }

  const rawToken = authHeader.slice("Bearer ".length).trim();
  if (!rawToken.startsWith("fs_live_")) {
    return {
      authorized: false,
      status: 401,
      error: "Format token tidak valid. API token FairShare diawali dengan 'fs_live_'",
    };
  }

  try {
    const tokenHash = hashToken(rawToken);

    let foundToken = await db.query.apiTokens.findFirst({
      where: and(eq(apiTokens.tokenHash, tokenHash), eq(apiTokens.isRevoked, false)),
      with: {
        user: true,
      },
    });

    // Environment-configured official agent token. It is recorded once for
    // auditability, and NEVER auto-creates a user or grants administrator
    // authority to an account that does not already exist.
    if (!foundToken && OFFICIAL_AI_AGENT_TOKEN && rawToken === OFFICIAL_AI_AGENT_TOKEN) {
      const agentEmail = process.env.FAIRSHARE_AGENT_EMAIL?.trim().toLowerCase();
      if (!agentEmail) {
        return {
          authorized: false,
          status: 503,
          error:
            "FAIRSHARE_AGENT_EMAIL belum diset. Setel env FAIRSHARE_AGENT_EMAIL ke email akun pemilik agent.",
        };
      }

      const agentUser = await db.query.users.findFirst({
        where: eq(users.email, agentEmail),
      });

      if (!agentUser) {
        return {
          authorized: false,
          status: 503,
          error: `Akun agent '${agentEmail}' tidak ditemukan. Buat akun tersebut (atau promosikan ke admin) terlebih dahulu.`,
        };
      }

      const [recorded] = await db
        .insert(apiTokens)
        .values({
          userId: agentUser.id,
          name: "Official AI Agent Token (env)",
          tokenHash,
          tokenPrefix: `fs_live_${tokenHash.slice(0, 8)}`,
          scopes: OFFICIAL_AI_AGENT_SCOPES,
        })
        .returning();

      foundToken = { ...recorded, user: agentUser };
    }

    if (!foundToken || !foundToken.user) {
      return {
        authorized: false,
        status: 401,
        error: "Token API tidak valid atau telah dicabut.",
      };
    }

    if (foundToken.expiresAt && new Date(foundToken.expiresAt) < new Date()) {
      return {
        authorized: false,
        status: 401,
        error: "Token API telah kedaluwarsa. Silakan lakukan rotasi atau buat token baru.",
      };
    }

    const limit = checkRateLimit(foundToken.id);
    if (!limit.allowed) {
      return {
        authorized: false,
        status: 429,
        error:
          "Terlalu banyak permintaan (Rate limit terlampaui: batas 120 request/menit). Silakan coba lagi beberapa saat.",
      };
    }

    const caller = {
      id: foundToken.user.id,
      email: foundToken.user.email,
      name: foundToken.user.name,
      role: foundToken.user.role || "user",
    };

    const required = requiredScope
      ? Array.isArray(requiredScope)
        ? requiredScope
        : [requiredScope]
      : [];

    const hasScope =
      required.length === 0 || required.some((scope) => foundToken!.scopes.includes(scope));

    if (!hasScope) {
      return {
        authorized: false,
        status: 403,
        error: `Token tidak memiliki izin yang dibutuhkan ('${required.join("' atau '")}'). Izin token Anda: ${foundToken.scopes.join(", ")}`,
        user: caller,
        tokenId: foundToken.id,
        tokenScopes: foundToken.scopes,
      };
    }

    try {
      await db
        .update(apiTokens)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiTokens.id, foundToken.id));
    } catch {
      // Non-fatal: usage bookkeeping must not fail the request.
    }

    return {
      authorized: true,
      user: caller,
      tokenId: foundToken.id,
      tokenScopes: foundToken.scopes,
    };
  } catch (err) {
    console.error("verifyApiRequest failed:", err);
    return {
      authorized: false,
      status: 500,
      error: "Terjadi kesalahan saat memverifikasi token API.",
    };
  }
}

export async function verifyAdminApiRequest(
  req: RequestWithHeaders,
  requiredScope: ApiScope = "admin:manage"
): Promise<AuthResult> {
  const auth = await verifyApiRequest(req, requiredScope);
  if (!auth.authorized) {
    return auth;
  }

  const hasAdminScope = auth.tokenScopes?.includes("admin:manage");
  const isUserAdmin = auth.user?.role === "admin";

  if (!hasAdminScope && !isUserAdmin) {
    return {
      authorized: false,
      status: 403,
      error: "Akses Ditolak: Diperlukan hak akses Administrator atau scope 'admin:manage'.",
      user: auth.user,
      tokenId: auth.tokenId,
      tokenScopes: auth.tokenScopes,
    };
  }

  return auth;
}
