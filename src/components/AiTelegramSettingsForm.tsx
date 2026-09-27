"use client";

import { useState, useTransition } from "react";
import {
  saveUserAiSettingsAction,
  testTelegramConnectionAction,
  testAiConnectionAction,
} from "../server/actions/aiSettings";
import {
  AI_PROVIDERS,
  AIProviderId,
} from "../lib/ai/providers";
import {
  Bot,
  Key,
  Cpu,
  Mic,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Info,
} from "lucide-react";

interface AiTelegramSettingsFormProps {
  initialSettings: {
    telegramBotToken: string | null;
    telegramBotTokenMasked: string;
    telegramBotUsername: string | null;
    isBotActive: boolean;
    telegramChatId: string | null;
    aiProvider: AIProviderId;
    aiApiKey: string | null;
    aiApiKeyMasked: string;
    aiModel: string;
    customModelId: string | null;
    voiceResponseMode: "text" | "voice" | "both";
  };
}

export function AiTelegramSettingsForm({
  initialSettings,
}: AiTelegramSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  // Telegram states
  const [botToken, setBotToken] = useState(
    initialSettings.telegramBotTokenMasked || ""
  );
  const [botUsername, setBotUsername] = useState(
    initialSettings.telegramBotUsername || ""
  );
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramTestStatus, setTelegramTestStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // AI states
  const [selectedProvider, setSelectedProvider] = useState<AIProviderId>(
    initialSettings.aiProvider || "deepseek"
  );
  const [apiKey, setApiKey] = useState(initialSettings.aiApiKeyMasked || "");
  const [modelChoice, setModelChoice] = useState(initialSettings.aiModel || "");
  const [customModelId, setCustomModelId] = useState(
    initialSettings.customModelId || ""
  );
  const [useCustomModel, setUseCustomModel] = useState(
    Boolean(initialSettings.customModelId)
  );
  const [voiceMode, setVoiceMode] = useState<"text" | "voice" | "both">(
    initialSettings.voiceResponseMode || "text"
  );

  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestStatus, setAiTestStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const [saveStatus, setSaveStatus] = useState<{
    error?: string;
    success?: boolean;
  } | null>(null);

  const currentProviderDef =
    AI_PROVIDERS.find((p) => p.id === selectedProvider) || AI_PROVIDERS[0];

  const handleProviderChange = (pId: AIProviderId) => {
    setSelectedProvider(pId);
    const p = AI_PROVIDERS.find((item) => item.id === pId);
    if (p) {
      setModelChoice(p.defaultModel);
      setCustomModelId("");
      setUseCustomModel(false);
    }
  };

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    setTelegramTestStatus(null);
    try {
      const res = await testTelegramConnectionAction(botToken);
      if (res.success && res.bot) {
        setBotUsername(res.bot.username);
        setTelegramTestStatus({
          success: true,
          message: `Koneksi Berhasil! Terhubung ke Bot @${res.bot.username} (${res.bot.first_name}).`,
        });
      } else {
        setTelegramTestStatus({
          success: false,
          message: res.error || "Gagal menghubungi bot Telegram.",
        });
      }
    } catch (err: any) {
      setTelegramTestStatus({
        success: false,
        message: err?.message || "Kesalahan jaringan.",
      });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleTestAi = async () => {
    setIsTestingAi(true);
    setAiTestStatus(null);
    try {
      const res = await testAiConnectionAction({
        provider: selectedProvider,
        apiKey,
        model: modelChoice,
        customModelId: useCustomModel ? customModelId : undefined,
      });

      if (res.success) {
        setAiTestStatus({
          success: true,
          message: `Koneksi AI Berhasil! Respons dari ${selectedProvider}: "${res.content.slice(0, 100)}..."`,
        });
      } else {
        setAiTestStatus({
          success: false,
          message: res.error || "Gagal menghubungi API provider AI.",
        });
      }
    } catch (err: any) {
      setAiTestStatus({
        success: false,
        message: err?.message || "Kesalahan jaringan saat pengujian AI.",
      });
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);

    const formData = new FormData();
    formData.append("telegramBotToken", botToken);
    formData.append("aiProvider", selectedProvider);
    formData.append("aiApiKey", apiKey);
    formData.append("aiModel", modelChoice);
    if (useCustomModel && customModelId.trim()) {
      formData.append("customModelId", customModelId.trim());
    } else {
      formData.append("customModelId", "");
    }
    formData.append("voiceResponseMode", voiceMode);

    startTransition(async () => {
      const res = await saveUserAiSettingsAction(null, formData);
      if (res?.error) {
        setSaveStatus({ error: res.error });
      } else {
        setSaveStatus({ success: true });
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {saveStatus?.error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{saveStatus.error}</span>
        </div>
      )}

      {saveStatus?.success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Pengaturan Bot Telegram & AI berhasil disimpan dan aktif!</span>
        </div>
      )}

      {/* Bagian 1: Integrasi Telegram Bot */}
      <div className="card-diskon bg-white p-5 sm:p-8 border border-slate-200 space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                <Send className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                1. Hubungkan Bot Telegram
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Buat bot gratis di Telegram melalui <strong>@BotFather</strong>, salin token bot Anda, dan tempel di bawah ini.
            </p>
          </div>

          {botUsername && (
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-800">
              <span>@{botUsername}</span>
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Token Bot Telegram
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Contoh: 1234567890:ABCdefGhIJKlmNoPQRstUVwxyZ"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={isTestingTelegram || !botToken}
                className="btn-pill-primary text-xs py-2 px-4 shrink-0 font-semibold"
              >
                {isTestingTelegram ? "Menguji..." : "Tes Koneksi Telegram"}
              </button>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Token Anda disimpan dengan aman dan disamarkan di tampilan.
            </span>
          </div>

          {telegramTestStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                telegramTestStatus.success
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
            >
              {telegramTestStatus.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{telegramTestStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bagian 2: Konfigurasi Provider AI */}
      <div className="card-diskon bg-white p-5 sm:p-8 border border-slate-200 space-y-6">
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Cpu className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              2. Konfigurasi Provider AI & Model
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Pilih provider LLM yang Anda sukai, gunakan API key Anda sendiri, dan tentukan model kecerdasan buatan.
          </p>
        </div>

        {/* Provider Selector Cards */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Pilih Penyedia AI (Provider)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {AI_PROVIDERS.map((provider) => {
              const isSelected = selectedProvider === provider.id;
              return (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => handleProviderChange(provider.id)}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? "bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-lime-400"
                      : "bg-white text-slate-800 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs sm:text-sm">{provider.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        isSelected
                          ? "bg-[#b7e913] text-black"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {provider.badge}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] line-clamp-2 ${
                      isSelected ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {provider.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* API Key Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              API Key {currentProviderDef.name}
            </label>
            <a
              href={currentProviderDef.docUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-lime-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Dapatkan API Key di Konsol {currentProviderDef.name}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="relative">
            <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={`sk-... (Masukkan API key ${currentProviderDef.name})`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Kunci API Anda disimpan terenkripsi dan tidak pernah diumbar ke publik.
          </span>
        </div>

        {/* Model Selection: Dropdown or Manual ID */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Pilihan Model
            </label>
            <button
              type="button"
              onClick={() => setUseCustomModel(!useCustomModel)}
              className="text-[11px] text-slate-600 hover:text-slate-950 font-bold underline"
            >
              {useCustomModel
                ? "← Pilih dari Daftar Model Umum"
                : "+ Ketik ID Model Manual"}
            </button>
          </div>

          {!useCustomModel ? (
            <div>
              <select
                value={modelChoice}
                onChange={(e) => setModelChoice(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white"
              >
                {currentProviderDef.commonModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.description}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder="Ketik Model ID persis, misal: deepseek-chat atau claude-3-5-sonnet-20241022"
                value={customModelId}
                onChange={(e) => setCustomModelId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Gunakan ID model spesifik yang disediakan oleh API {currentProviderDef.name}.
              </span>
            </div>
          )}

          {/* Test AI Connection Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestAi}
              disabled={isTestingAi || !apiKey}
              className="btn-pill-primary text-xs py-2 px-4 font-semibold"
            >
              {isTestingAi ? "Menguji API..." : "Tes Koneksi AI"}
            </button>
          </div>

          {aiTestStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                aiTestStatus.success
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
            >
              {aiTestStatus.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{aiTestStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bagian 3: Mode Interaksi Suara (Voice Message) */}
      <div className="card-diskon bg-white p-5 sm:p-8 border border-slate-200 space-y-4">
        <div className="border-b border-slate-100 pb-3 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Mic className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              3. Alur Interaksi Suara (Voice Message)
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Saat Anda mengirimkan voice note di Telegram, sistem mentranskripsi audio menjadi teks dan memprosesnya dengan AI.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Format Balasan Bot Telegram untuk Voice Note:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "text",
                title: "Teks Saja (Rekomendasi)",
                desc: "Bot membalas dalam format pesan teks Telegram rapi dan cepat dibaca.",
              },
              {
                id: "voice",
                title: "Suara Saja",
                desc: "Bot merespons balik dalam bentuk audio/voice note.",
              },
              {
                id: "both",
                title: "Teks & Suara (Keduanya)",
                desc: "Bot mengirimkan balasan teks ringkas diikuti voice audio.",
              },
            ].map((mode) => {
              const isSelected = voiceMode === mode.id;
              return (
                <label
                  key={mode.id}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-slate-950 bg-slate-50 ring-2 ring-lime-400 font-semibold"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="voiceMode"
                    value={mode.id}
                    checked={isSelected}
                    onChange={() => setVoiceMode(mode.id as any)}
                    className="sr-only"
                  />
                  <div className="space-y-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                      {mode.title}
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-relaxed">
                      {mode.desc}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-pill-lime text-xs sm:text-sm py-3 px-8 font-bold flex items-center gap-2 shadow-md"
        >
          <Save className="h-4 w-4" />
          <span>{isPending ? "Menyimpan Konfigurasi..." : "Simpan Semua Pengaturan"}</span>
        </button>
      </div>
    </form>
  );
}
