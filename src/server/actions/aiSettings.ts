"use server";

import { db } from "../../db";
import { userAiSettings } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "../../lib/auth";
import {
  AIProviderId,
  executeAIRequest,
  maskSecret,
} from "../../lib/ai/providers";
import { testTelegramBotToken, setTelegramWebhook } from "../../lib/telegram/bot";
import { ensureDatabaseSchema } from "../../db/migrate";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export interface AISettingsState {
  error?: string;
  success?: boolean;
}

export async function getUserAiSettings() {
  await ensureDatabaseSchema();
  const user = await getSessionUser();
  if (!user) return null;

  const settings = await db.query.userAiSettings.findFirst({
    where: eq(userAiSettings.userId, user.id),
  });

  if (!settings) {
    return {
      telegramBotToken: "",
      telegramBotTokenMasked: "",
      telegramBotUsername: "",
      isBotActive: false,
      telegramChatId: "",
      aiProvider: "deepseek" as AIProviderId,
      aiApiKey: "",
      aiApiKeyMasked: "",
      aiModel: "deepseek-chat",
      customModelId: "",
      voiceResponseMode: "text" as "text" | "voice" | "both",
    };
  }

  return {
    ...settings,
    aiProvider: (settings.aiProvider || "deepseek") as AIProviderId,
    voiceResponseMode: (settings.voiceResponseMode || "text") as "text" | "voice" | "both",
    telegramBotTokenMasked: maskSecret(settings.telegramBotToken),
    aiApiKeyMasked: maskSecret(settings.aiApiKey),
  };
}

export async function saveUserAiSettingsAction(
  _prevState: AISettingsState | null,
  formData: FormData
): Promise<AISettingsState> {
  await ensureDatabaseSchema();
  const user = await getSessionUser();
  if (!user) {
    return { error: "Silakan masuk terlebih dahulu." };
  }

  const existing = await db.query.userAiSettings.findFirst({
    where: eq(userAiSettings.userId, user.id),
  });

  const rawBotToken = formData.get("telegramBotToken");
  const rawProvider = (formData.get("aiProvider") || "deepseek") as AIProviderId;
  const rawApiKey = formData.get("aiApiKey");
  const rawModel = (formData.get("aiModel") || "deepseek-chat") as string;
  const rawCustomModelId = formData.get("customModelId") as string;
  const rawVoiceMode = (formData.get("voiceResponseMode") || "text") as "text" | "voice" | "both";

  let finalBotToken = existing?.telegramBotToken || null;
  if (typeof rawBotToken === "string" && rawBotToken.trim()) {
    const trimmed = rawBotToken.trim();
    if (!trimmed.includes("••••••••")) {
      finalBotToken = trimmed;
    }
  }

  let finalApiKey = existing?.aiApiKey || null;
  if (typeof rawApiKey === "string" && rawApiKey.trim()) {
    const trimmed = rawApiKey.trim();
    if (!trimmed.includes("••••••••")) {
      finalApiKey = trimmed;
    }
  }

  let botUsername = existing?.telegramBotUsername || null;
  let isBotActive = existing?.isBotActive || false;

  // If a new bot token is provided, verify it
  if (finalBotToken && finalBotToken !== existing?.telegramBotToken) {
    const testResult = await testTelegramBotToken(finalBotToken);
    if (!testResult.success) {
      return { error: `Token Telegram tidak valid: ${testResult.error}` };
    }
    botUsername = testResult.bot?.username || null;
    isBotActive = true;

    // Setup webhook if URL is HTTPS
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://fairshare.copilotmarketing.id";
    const webhookSecret = crypto.randomBytes(16).toString("hex");
    const webhookUrl = `${appUrl}/api/telegram/webhook`;
    if (webhookUrl.startsWith("https://")) {
      await setTelegramWebhook(finalBotToken, webhookUrl, webhookSecret);
    }
  }

  const webhookSecret = existing?.telegramWebhookSecret || crypto.randomBytes(16).toString("hex");

  await db
    .insert(userAiSettings)
    .values({
      userId: user.id,
      telegramBotToken: finalBotToken,
      telegramBotUsername: botUsername,
      telegramWebhookSecret: webhookSecret,
      isBotActive,
      aiProvider: rawProvider,
      aiApiKey: finalApiKey,
      aiModel: rawModel,
      customModelId: rawCustomModelId ? rawCustomModelId.trim() : null,
      voiceResponseMode: rawVoiceMode,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [userAiSettings.userId],
      set: {
        telegramBotToken: finalBotToken,
        telegramBotUsername: botUsername,
        isBotActive,
        aiProvider: rawProvider,
        aiApiKey: finalApiKey,
        aiModel: rawModel,
        customModelId: rawCustomModelId ? rawCustomModelId.trim() : null,
        voiceResponseMode: rawVoiceMode,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/dashboard/settings");

  return { success: true };
}

export async function testTelegramConnectionAction(botToken: string) {
  await ensureDatabaseSchema();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: "Silakan masuk terlebih dahulu." };
  }

  // If masked, retrieve from DB
  let tokenToTest = botToken.trim();
  if (tokenToTest.includes("••••••••") || !tokenToTest) {
    const existing = await db.query.userAiSettings.findFirst({
      where: eq(userAiSettings.userId, user.id),
    });
    if (!existing?.telegramBotToken) {
      return { success: false, error: "Token bot belum dimasukkan." };
    }
    tokenToTest = existing.telegramBotToken;
  }

  return await testTelegramBotToken(tokenToTest);
}

export async function testAiConnectionAction({
  provider,
  apiKey,
  model,
  customModelId,
}: {
  provider: AIProviderId;
  apiKey: string;
  model: string;
  customModelId?: string;
}) {
  await ensureDatabaseSchema();
  const user = await getSessionUser();
  if (!user) {
    return { success: false, content: "", error: "Silakan masuk terlebih dahulu." };
  }

  let keyToTest = apiKey.trim();
  if (keyToTest.includes("••••••••") || !keyToTest) {
    const existing = await db.query.userAiSettings.findFirst({
      where: eq(userAiSettings.userId, user.id),
    });
    if (!existing?.aiApiKey) {
      return { success: false, content: "", error: "API Key belum dimasukkan." };
    }
    keyToTest = existing.aiApiKey;
  }

  return await executeAIRequest({
    provider,
    apiKey: keyToTest,
    model,
    customModelId,
    systemPrompt: "Jawablah dengan 1 kalimat ramah bahwa koneksi FairShare AI berhasil.",
    userPrompt: "Halo, tes koneksi API provider!",
  });
}
