/**
 * Telegram Bot Helper & Voice Message Handler for FairShare
 */

export interface TelegramBotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
}

export async function testTelegramBotToken(botToken: string): Promise<{
  success: boolean;
  bot?: TelegramBotInfo;
  error?: string;
}> {
  try {
    const cleanToken = botToken.trim();
    if (!cleanToken) {
      return { success: false, error: "Token bot Telegram tidak boleh kosong." };
    }

    const res = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`);
    const data = await res.json();

    if (!data.ok) {
      return {
        success: false,
        error: data.description || "Token bot Telegram tidak valid atau telah dicabut oleh BotFather.",
      };
    }

    return {
      success: true,
      bot: data.result,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Gagal menghubungi server Telegram: ${err?.message || "Kesalahan jaringan"}`,
    };
  }
}

export async function setTelegramWebhook(
  botToken: string,
  webhookUrl: string,
  secretToken?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanToken = botToken.trim();
    const body: Record<string, string> = { url: webhookUrl };
    if (secretToken) body.secret_token = secretToken;

    const res = await fetch(`https://api.telegram.org/bot${cleanToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!data.ok) {
      return { success: false, error: data.description || "Gagal memasang webhook Telegram." };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Kesalahan saat set webhook Telegram." };
  }
}

export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string
): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
    const data = await res.json();
    return Boolean(data.ok);
  } catch (err) {
    console.error("Error sending Telegram message:", err);
    return false;
  }
}

export async function getTelegramFileUrl(
  botToken: string,
  fileId: string
): Promise<string | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken.trim()}/getFile?file_id=${fileId}`);
    const data = await res.json();
    if (data.ok && data.result?.file_path) {
      return `https://api.telegram.org/file/bot${botToken.trim()}/${data.result.file_path}`;
    }
    return null;
  } catch (err) {
    console.error("Error getting Telegram file:", err);
    return null;
  }
}
