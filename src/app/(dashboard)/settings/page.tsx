import { getSessionUser } from "../../../lib/auth";
import { getUserAiSettings } from "../../../server/actions/aiSettings";
import { redirect } from "next/navigation";
import { Navbar } from "../../../components/Navbar";
import { AiTelegramSettingsForm } from "../../../components/AiTelegramSettingsForm";
import Link from "next/link";
import { Bot, Key, ArrowLeft, Shield } from "lucide-react";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?redirect=/settings");
  }

  const settings = await getUserAiSettings();

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC]">
      <Navbar user={user} />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-6 sm:py-10 space-y-6">
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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Pengaturan AI & Integrasi Telegram
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Kustomisasi bot Telegram, provider model AI (DeepSeek, Claude, Gemini, dll.), dan alur pemrosesan suara.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/developer"
                className="btn-pill-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 font-semibold"
              >
                <Key className="h-3.5 w-3.5" />
                <span>Token & API Agent</span>
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
      </main>
    </div>
  );
}
