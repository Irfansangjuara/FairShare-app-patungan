"use server";

import { db } from "../../db";
import { apiTokens } from "../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSessionUser } from "../../lib/auth";
import { generateTokenSecret, hashToken, ApiScope } from "../../lib/api/auth";
import { apiTokenSchema } from "../../lib/validation";
import { ensureDatabaseSchema } from "../../db/migrate";
import { revalidatePath } from "next/cache";

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
    scopes: existing.scopes,
  });

  revalidatePath("/dashboard/token");
  revalidatePath("/dashboard/settings");

  return {
    success: true,
    rawToken,
    tokenName: `${existing.name} (Rotated)`,
  };
}
