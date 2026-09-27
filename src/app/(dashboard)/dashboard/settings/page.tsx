import { getSessionUser } from "@/lib/auth";
import { getUserAiSettings } from "@/server/actions/aiSettings";
import { redirect } from "next/navigation";
import { AiTelegramSettingsForm } from "@/components/AiTelegramSettingsForm";
import Link from "next/link";
import { Key, ArrowLeft, Bot } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengaturan AI & Bot Telegram | FairShare",
  description:
    "Kustomisasi bot Telegram, provider model AI (DeepSeek, Claude, Gemini, dll.), dan alur pemrosesan suara FairShare.",
  alternates: {
    canonical: "/dashboard/settings",
  },
};

export default async function DashboardSettingsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirect=/dashboard/settings");
  }

  const settings = await getUserAiSettings();

  return (
    <div className="mx-auto max-w-5xl w-full space-y-6">
      {/* Navigation & Header */}
      <div className="space-y-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Dashboard</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-950 uppercase tracking-wider font-sans mb-2">
              <Bot className="h-3.5 w-3.5 text-sky-800" />
              <span>Konfigurasi AI &amp; Telegram Bot</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-sans">
              Pengaturan AI &amp; Integrasi Telegram
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kustomisasi bot Telegram, provider model AI (DeepSeek, Claude, Gemini, dll.), dan alur pemrosesan suara.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/token"
              className="btn-pill-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 font-semibold"
            >
              <Key className="h-3.5 w-3.5" />
              <span>Token Akses Telegram</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <AiTelegramSettingsForm
        initialSettings={
          settings || {
            telegramBotToken: "",
            telegramBotTokenMasked: "",
            telegramBotUsername: "",
            isBotActive: false,
            telegramChatId: "",
            aiProvider: "deepseek",
            aiApiKey: "",
            aiApiKeyMasked: "",
            aiModel: "deepseek-chat",
            customModelId: "",
            voiceResponseMode: "text",
          }
        }
      />
    </div>
  );
}
