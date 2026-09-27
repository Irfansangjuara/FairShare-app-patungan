import { db } from "../../db/index.ts";
import { apiTokens, users } from "../../db/schema.ts";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export type RequestWithHeaders = Request | { headers: { get(name: string): string | null } };

export type ApiScope =
  | "read:campaigns"
  | "write:expenses"
  | "read:settlements"
  | "write:settlements";

export interface AuthResult {
  authorized: boolean;
  status?: number;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
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
  const tokenPrefix = `fs_live_${randomBytes.slice(0, 6)}...`;
  return { rawToken, tokenHash, tokenPrefix };
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitBucket>();

export function checkRateLimit(
  tokenId: string,
  limit = 60,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = rateLimitMap.get(tokenId);
  if (!bucket || now > bucket.resetAt) {
    rateLimitMap.set(tokenId, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

export async function verifyApiRequest(
  req: RequestWithHeaders,
  requiredScope?: ApiScope
): Promise<AuthResult> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authorized: false,
      status: 401,
      error: "Otorisasi Bearer Token diperlukan. Sertakan header 'Authorization: Bearer fs_live_...'",
    };
  }

  const rawToken = authHeader.replace("Bearer ", "").trim();
  if (!rawToken.startsWith("fs_live_")) {
    return {
      authorized: false,
      status: 401,
      error: "Format token tidak valid. API token FairShare diawali dengan 'fs_live_'",
    };
  }

  const tokenHash = hashToken(rawToken);

  const foundToken = await db.query.apiTokens.findFirst({
    where: and(eq(apiTokens.tokenHash, tokenHash), eq(apiTokens.isRevoked, false)),
    with: {
      user: true,
    },
  });

  if (!foundToken || !foundToken.user) {
    return {
      authorized: false,
      status: 401,
      error: "Token API tidak valid atau telah dicabut.",
    };
  }

  // Check token expiry if set
  if (foundToken.expiresAt && new Date(foundToken.expiresAt) < new Date()) {
    return {
      authorized: false,
      status: 401,
      error: "Token API telah kedaluwarsa. Silakan lakukan rotasi atau buat token baru.",
    };
  }

  // Rate limiting: 60 requests/minute per active token
  const rateLimit = checkRateLimit(foundToken.id, 60, 60_000);
  if (!rateLimit.allowed) {
    return {
      authorized: false,
      status: 429,
      error: "Terlalu banyak permintaan (Rate limit terlampaui: batas 60 request/menit). Silakan coba lagi beberapa saat.",
    };
  }

  // Scope check
  if (requiredScope && !foundToken.scopes.includes(requiredScope)) {
    return {
      authorized: false,
      status: 403,
      error: `Token tidak memiliki izin yang dibutuhkan ('${requiredScope}'). Izin token Anda: ${foundToken.scopes.join(", ")}`,
    };
  }

  // Update lastUsedAt asynchronously
  try {
    await db
      .update(apiTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiTokens.id, foundToken.id));
  } catch (err) {
    // Non-fatal
  }

  return {
    authorized: true,
    user: {
      id: foundToken.user.id,
      email: foundToken.user.email,
      name: foundToken.user.name,
    },
    tokenId: foundToken.id,
    tokenScopes: foundToken.scopes,
  };
}
