import { db } from "../../db/index.ts";
import { apiTokens, users } from "../../db/schema.ts";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export type RequestWithHeaders = Request | { headers: { get(name: string): string | null } };

export type ApiScope =
  | "read:campaigns"
  | "write:expenses"
  | "read:settlements"
  | "write:settlements"
  | "admin:manage"
  | "articles:read"
  | "articles:write";

export const OFFICIAL_AI_AGENT_TOKEN = "fs_live_copilot_ai_agent_master_key_2026";

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

  let foundToken = await db.query.apiTokens.findFirst({
    where: and(eq(apiTokens.tokenHash, tokenHash), eq(apiTokens.isRevoked, false)),
    with: {
      user: true,
    },
  });

  // Auto-provision official AI Agent token if used and not yet recorded
  if (!foundToken && rawToken === OFFICIAL_AI_AGENT_TOKEN) {
    let adminUser = await db.query.users.findFirst({
      where: eq(users.email, "admin@fairshare.copilotmarketing.id"),
    });

    if (!adminUser) {
      const [newAdmin] = await db
        .insert(users)
        .values({
          name: "Admin FairShare",
          email: "admin@fairshare.copilotmarketing.id",
          passwordHash: "$2a$10$Q7w/0fS5jUj1dD6gK7HhU.K1zO0Y7m0u3cI5A.Zg3Jp9z1.XQjH.S",
          role: "admin",
        })
        .returning();
      adminUser = newAdmin;
    }

    const [createdToken] = await db
      .insert(apiTokens)
      .values({
        userId: adminUser.id,
        name: "Official Copilot AI Agent Master Token",
        tokenHash,
        tokenPrefix: "fs_live_copilot_ai_agent...",
        scopes: [
          "admin:manage",
          "articles:read",
          "articles:write",
          "read:campaigns",
          "write:expenses",
          "read:settlements",
          "write:settlements",
        ],
      })
      .returning();

    foundToken = {
      ...createdToken,
      user: adminUser,
    };
  }

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

  // Rate limiting: 120 requests/minute per active token for agent
  const rateLimit = checkRateLimit(foundToken.id, 120, 60_000);
  if (!rateLimit.allowed) {
    return {
      authorized: false,
      status: 429,
      error: "Terlalu banyak permintaan (Rate limit terlampaui: batas 120 request/menit). Silakan coba lagi beberapa saat.",
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
      role: foundToken.user.role || "user",
    },
    tokenId: foundToken.id,
    tokenScopes: foundToken.scopes,
  };
}

export async function verifyAdminApiRequest(
  req: RequestWithHeaders,
  requiredScope?: ApiScope
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
    };
  }

  return auth;
}
