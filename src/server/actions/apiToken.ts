"use server";

import { db } from "../../db";
import { apiTokens } from "../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSessionUser } from "../../lib/auth";
import { generateTokenSecret, hashToken, ApiScope } from "../../lib/api/auth";
import { ADMIN_ONLY_SCOPES, USER_ASSIGNABLE_SCOPES } from "../../lib/scopes.ts";
import { apiTokenSchema } from "../../lib/validation";
import { ensureDatabaseSchema } from "../../db/migrate";
import { revalidatePath } from "next/cache";

/**
 * Scope grants are role-gated: a non-admin may only mint the campaign/expense
 * scopes. Privileged scopes (article authoring, admin:manage) require the
 * `admin` role, so a self-issued token can never escalate to administrator.
 */
function rejectUnauthorizedScopes(
  scopes: string[],
  role: string
): { ok: true } | { ok: false; rejected: string[] } {
  const allowed = new Set<string>(
    role === "admin" ? [...USER_ASSIGNABLE_SCOPES, ...ADMIN_ONLY_SCOPES] : USER_ASSIGNABLE_SCOPES
  );
  const rejected = scopes.filter((scope) => !allowed.has(scope));
  return rejected.length === 0 ? { ok: true } : { ok: false, rejected };
}

export interface CreateTokenResult {
  error?: string;
  success?: boolean;
  rawToken?: string;
  tokenName?: string;
}

export async function getUserApiTokensAction() {
  await ensureDatabaseSchema();
  const user = await getSessionUser();
  if (!user) return [];

  const tokens = await db.query.apiTokens.findMany({
    where: eq(apiTokens.userId, user.id),
    orderBy: [desc(apiTokens.createdAt)],
  });

  return tokens.map((t) => ({
    id: t.id,
    name: t.name,
    tokenPrefix: t.tokenPrefix,
    scopes: t.scopes,
    lastUsedAt: t.lastUsedAt,
    expiresAt: t.expiresAt,
    isRevoked: t.isRevoked,
    createdAt: t.createdAt,
  }));
}

export async function createApiTokenAction(
  name: string,
  scopes: string[]
): Promise<CreateTokenResult> {
  await ensureDatabaseSchema();
  const user = await getSessionUser();
  if (!user) {
    return { error: "Silakan masuk terlebih dahulu." };
  }

  const parsed = apiTokenSchema.safeParse({ name, scopes });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const scopeCheck = rejectUnauthorizedScopes(parsed.data.scopes, user.role);
  if (!scopeCheck.ok) {
    return {
      error: `Scope berikut hanya dapat diberikan oleh administrator: ${scopeCheck.rejected.join(", ")}.`,
    };
  }

  const { rawToken, tokenHash, tokenPrefix } = generateTokenSecret();

  await db.insert(apiTokens).values({
    userId: user.id,
    name: parsed.data.name,
    tokenHash,
    tokenPrefix,
    scopes: parsed.data.scopes,
  });

  revalidatePath("/dashboard/token");
  revalidatePath("/dashboard/settings");

  return {
    success: true,
    rawToken,
    tokenName: parsed.data.name,
  };
}

export async function revokeApiTokenAction(tokenId: string) {
  await ensureDatabaseSchema();
  const user = await getSessionUser();
  if (!user) {
    return { error: "Silakan masuk terlebih dahulu." };
  }

  await db
    .update(apiTokens)
    .set({ isRevoked: true })
    .where(and(eq(apiTokens.id, tokenId), eq(apiTokens.userId, user.id)));

  revalidatePath("/dashboard/token");
  revalidatePath("/dashboard/settings");

  return { success: true };
}

export async function rotateApiTokenAction(tokenId: string): Promise<CreateTokenResult> {
  await ensureDatabaseSchema();
  const user = await getSessionUser();
  if (!user) {
    return { error: "Silakan masuk terlebih dahulu." };
  }

  const existing = await db.query.apiTokens.findFirst({
    where: and(eq(apiTokens.id, tokenId), eq(apiTokens.userId, user.id)),
  });

  if (!existing) {
    return { error: "Token tidak ditemukan." };
  }

  // Legacy tokens may already carry privileged scopes; never propagate a scope
  // the current user is not entitled to hold.
  const scopeCheck = rejectUnauthorizedScopes(existing.scopes, user.role);
  const rotatedScopes = scopeCheck.ok ? existing.scopes : existing.scopes.filter((s) => !scopeCheck.rejected.includes(s));

  if (rotatedScopes.length === 0) {
    return { error: "Token ini hanya memiliki scope istimewa yang tidak dapat Anda rotasi." };
  }

  // Revoke existing
  await db
    .update(apiTokens)
    .set({ isRevoked: true })
    .where(eq(apiTokens.id, tokenId));

  // Generate new with same name & scopes
  const { rawToken, tokenHash, tokenPrefix } = generateTokenSecret();

  await db.insert(apiTokens).values({
    userId: user.id,
    name: `${existing.name} (Rotated)`,
    tokenHash,
    tokenPrefix,
    scopes: rotatedScopes,
  });

  revalidatePath("/dashboard/token");
  revalidatePath("/dashboard/settings");

  return {
    success: true,
    rawToken,
    tokenName: `${existing.name} (Rotated)`,
  };
}
