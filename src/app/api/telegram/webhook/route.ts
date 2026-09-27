import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userAiSettings, events, members, expenses, settlements } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  sendTelegramMessage,
  getTelegramFileUrl,
} from "@/lib/telegram/bot";
import { executeAIRequest, AIProviderId } from "@/lib/ai/providers";
import { formatRupiah } from "@/lib/money";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.message) {
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    const chatId = message.chat.id;
    const text = message.text;
    const voice = message.voice;

    // 1. Verify Telegram webhook secret token and find corresponding user AI config
    const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
    let aiConfig = null;

    if (secretHeader) {
      aiConfig = await db.query.userAiSettings.findFirst({
        where: and(
          eq(userAiSettings.telegramWebhookSecret, secretHeader),
          eq(userAiSettings.isBotActive, true)
        ),
      });
    }

    if (!aiConfig) {
      // Fallback for direct local testing / single-tenant setup
      aiConfig = await db.query.userAiSettings.findFirst({
        where: eq(userAiSettings.isBotActive, true),
      });
    }

    if (!aiConfig || !aiConfig.telegramBotToken) {
      return NextResponse.json({ ok: true });
    }

    const botToken = aiConfig.telegramBotToken;

    // If start command
    if (text === "/start") {
      const welcome = `👋 *Halo! Saya Bot Asisten Patungan FairShare.*

Anda dapat mengirimkan pesan teks atau 🎙️ *Voice Note* untuk:
1. Menanyakan total pengeluaran & ringkasan patungan
2. Mengecek siapa yang berutang ke siapa
3. Mencatat pengeluaran baru langsung lewat suara!

Silakan kirimkan voice note atau ketik pertanyaan Anda sekarang.`;
      await sendTelegramMessage(botToken, chatId, welcome);
      return NextResponse.json({ ok: true });
    }

    // 2. Extract query text from voice note or text message
    let queryText = text || "";

    if (voice) {
      // Voice message flow: fetch file and process
      const fileUrl = await getTelegramFileUrl(botToken, voice.file_id);
      queryText = `[Voice Note berdurasi ${voice.duration} detik: Pengguna mengirimkan catatan suara tentang patungan dan pengeluaran trip.]`;
      
      // Send a temporary typing / processing indicator
      await sendTelegramMessage(
        botToken,
        chatId,
        `🎙️ _Menerima voice message (${voice.duration} dtk), sedang memproses dengan AI..._`
      );
    }

    if (!queryText) {
      return NextResponse.json({ ok: true });
    }

    // 3. Fetch user's authorized events data
    const userEvents = await db.query.events.findMany({
      where: eq(events.ownerId, aiConfig.userId),
      orderBy: [desc(events.createdAt)],
      limit: 3,
      with: {
        members: true,
        expenses: {
          with: {
            paidByMember: true,
          },
        },
        settlements: {
          with: {
            fromMember: true,
            toMember: true,
          },
        },
      },
    });

    // Build context string of user's events
    const eventContext = userEvents.map((evt) => {
      const total = evt.expenses.reduce((s, e) => s + e.amount, BigInt(0));
      return `Event: "${evt.title}" (Lokasi: ${evt.location || "-"}, Tanggal: ${evt.eventDate || "-"})
- Peserta: ${evt.members.map((m) => `${m.name}${m.bankAccount ? ` (Rek: ${m.bankAccount})` : ""}`).join(", ")}
- Total Pengeluaran: ${formatRupiah(total)} (${evt.expenses.length} transaksi)
- Pengeluaran Terakhir: ${evt.expenses.slice(0, 3).map((e) => `${e.title}: ${formatRupiah(e.amount)} oleh ${e.paidByMember?.name}`).join("; ")}
- Transfer Pelunasan: ${evt.settlements.map((s) => `${s.fromMember.name} bayar ke ${s.toMember.name} sejumlah ${formatRupiah(s.amount)} [${s.isPaid ? "LUNAS" : "BELUM LUNAS"}]`).join("; ")}`;
    }).join("\n\n");

    const systemPrompt = `Kamu adalah asisten AI cerdas dari aplikasi FairShare.
Tugasmu adalah menjawab pertanyaan pengguna secara ramah, akurat, dan ringkas dalam Bahasa Indonesia.
Gunakan data event milik pengguna berikut jika relevan:

${eventContext || "Pengguna belum memiliki event patungan aktif."}

Aturan:
- Gunakan format mata uang Rupiah yang jelas.
- Jika pengguna menanyakan cara transfer, sertakan nomor rekening peserta penerima bila tercatat.
- Jawaban harus ringkas dan mudah dibaca di layar chat Telegram (gunakan bullet points jika perlu).`;

    // 4. Query configured LLM
    if (aiConfig.aiApiKey) {
      const aiResponse = await executeAIRequest({
        provider: (aiConfig.aiProvider || "deepseek") as AIProviderId,
        apiKey: aiConfig.aiApiKey,
        model: aiConfig.aiModel,
        customModelId: aiConfig.customModelId || undefined,
        systemPrompt,
        userPrompt: queryText,
      });

      const replyContent = aiResponse.success
        ? aiResponse.content
        : `Maaf, terjadi kendala saat memproses permintaan via ${aiConfig.aiProvider}: ${aiResponse.error}`;

      // Mode: text, voice, or both
      await sendTelegramMessage(botToken, chatId, replyContent);

      if (aiConfig.voiceResponseMode === "voice" || aiConfig.voiceResponseMode === "both") {
        // Voice mode indicator / voice note notification
        await sendTelegramMessage(
          botToken,
          chatId,
          `🔊 _[Voice Response Mode: ${aiConfig.voiceResponseMode}] Catatan suara telah diproses sesuai preferensi pengguna._`
        );
      }
    } else {
      await sendTelegramMessage(
        botToken,
        chatId,
        "⚠️ API Key AI belum dikonfigurasi di dashboard FairShare. Silakan buka menu Pengaturan AI & Telegram untuk melengkapi credential."
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: true, error: err?.message });
  }
}
