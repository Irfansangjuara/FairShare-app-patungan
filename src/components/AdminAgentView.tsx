"use client";

import { useState } from "react";
import {
  Bot,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Terminal,
  FileText,
  Users,
  BarChart3,
  ExternalLink,
  Code2,
} from "lucide-react";
import Link from "next/link";

const APP_BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://fairshare.copilotmarketing.id"
).replace(/\/+$/, "");

interface AdminAgentViewProps {
  token: string | null;
}

export function AdminAgentView({ token }: AdminAgentViewProps) {
  const [showToken, setShowToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState<string | null>(null);

  // Only used inside documentation samples; never a real credential.
  const tokenPlaceholder = token ?? "<FAIRSHARE_AGENT_TOKEN>";

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    if (type === "token") {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedCurl(type);
      setTimeout(() => setCopiedCurl(null), 2000);
    }
  };

  const sampleCreateArticleCurl = `curl -X POST ${APP_BASE_URL}/api/v1/articles \\
  -H "Authorization: Bearer ${tokenPlaceholder}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "7 Strategi Mengatur Keuangan Liburan Bareng Teman",
    "summary": "Panduan praktis agar liburan grup tetap seru tanpa ada rasa tidak enak hati.",
    "content": "## Pendahuluan\\n\\nLiburan bersama teman sering terkendala masalah transparansi biaya...",
    "status": "published",
    "seoTitle": "7 Strategi Mengatur Keuangan Liburan Bareng Teman | FairShare",
    "seoDescription": "Pelajari trik patungan adil dan otomatis agar trip hemat dan menyenangkan."
  }'`;

  const sampleGetStatsCurl = `curl -X GET ${APP_BASE_URL}/api/v1/admin/stats \\
  -H "Authorization: Bearer ${tokenPlaceholder}"`;

  return (
    <div className="space-y-8">
      {/* Token Banner Card */}
      <div className="card-diskon bg-slate-950 text-white p-6 sm:p-8 border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#b7e913]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 px-3.5 py-1 text-xs font-semibold text-[#b7e913]">
            <Bot className="h-4 w-4" />
            <span>Master Token AI Agent & API Terverifikasi</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Kredensial Akses Otomasi AI Agent
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Gunakan Bearer Token resmi berikut untuk mengizinkan AI Agent (Claude, ChatGPT, Gemini, dsb.) mengelola artikel blog publik di <code className="text-[#b7e913] bg-slate-900 px-1.5 py-0.5 rounded">/blog</code>, memperbarui standar SEO Google, dan mengakses dashboard admin secara terprogram.
          </p>
        </div>

        {/* Token Box */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-[#b7e913]" />
              <span>AI Agent Master Secret Token</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors p-1 rounded-md hover:bg-slate-800"
              >
                {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showToken ? "Sembunyikan" : "Tampilkan"}</span>
              </button>
            </div>
          </div>

          {token ? (
            <div className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3">
              <code className="text-xs sm:text-sm font-mono text-[#b7e913] truncate">
                {showToken ? token : `${token.slice(0, 18)}••••••••••••••••••••••••••••••••`}
              </code>

              <button
                type="button"
                onClick={() => copyToClipboard(token, "token")}
                className="btn-pill-lime py-1.5 px-3 text-xs font-bold shrink-0 flex items-center gap-1 shadow-sm"
              >
                {copiedToken ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-black" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-black" />
                    <span>Salin Token</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[11px] sm:text-xs text-amber-200 leading-relaxed">
              Token agent belum dikonfigurasi. Set environment variable{" "}
              <code className="text-amber-100">FAIRSHARE_AGENT_TOKEN</code> (nilai acak minimal 32
              karakter) dan <code className="text-amber-100">FAIRSHARE_AGENT_EMAIL</code> pada
              environment deployment, lalu deploy ulang. Token tidak lagi ditanam di dalam kode.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Cakupan Izin (Scopes):</span>
            <span className="bg-slate-800 border border-slate-700 text-[#b7e913] px-2 py-0.5 rounded-full font-mono">
              admin:manage
            </span>
            <span className="bg-slate-800 border border-slate-700 text-lime-300 px-2 py-0.5 rounded-full font-mono">
              articles:write
            </span>
            <span className="bg-slate-800 border border-slate-700 text-blue-300 px-2 py-0.5 rounded-full font-mono">
              articles:read
            </span>
            <span className="bg-slate-800 border border-slate-700 text-purple-300 px-2 py-0.5 rounded-full font-mono">
              read:campaigns
            </span>
          </div>
        </div>
      </div>

      {/* API Documentation Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-lime-600" />
          <span>Dokumentasi Endpoint API untuk AI Agent</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Endpoint 1: Articles */}
          <div className="card-diskon bg-white border border-slate-200 p-5 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-lime-100 text-lime-900 flex items-center justify-center font-bold">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">
                    Manajemen Artikel Blog & SEO
                  </h4>
                  <p className="text-xs text-slate-500">
                    Otomasi publikasi konten di /blog
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-slate-50 rounded-lg font-mono flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                    POST
                  </span>
                  <span className="text-slate-700">/api/v1/articles</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg font-mono flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                    PATCH
                  </span>
                  <span className="text-slate-700">/api/v1/articles/[id]</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg font-mono flex items-center gap-2">
                  <span className="bg-slate-200 text-slate-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                    GET
                  </span>
                  <span className="text-slate-700">/api/v1/articles</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Mendukung pembuatan artikel baru dengan metadata Google SEO otomatis (canonical URL, JSON-LD Schema BlogPosting, summary, dan image).
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(sampleCreateArticleCurl, "curl-article")}
              className="btn-pill-secondary text-xs py-2 px-3 justify-center gap-1.5"
            >
              {copiedCurl === "curl-article" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>cURL Tersalin</span>
                </>
              ) : (
                <>
                  <Code2 className="h-3.5 w-3.5" />
                  <span>Salin Contoh Payload cURL</span>
                </>
              )}
            </button>
          </div>

          {/* Endpoint 2: Dashboard & Users */}
          <div className="card-diskon bg-white border border-slate-200 p-5 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">
                    Audit Dashboard & Manajemen User
                  </h4>
                  <p className="text-xs text-slate-500">
                    Statistik sistem dan keanggotaan
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-slate-50 rounded-lg font-mono flex items-center gap-2">
                  <span className="bg-slate-200 text-slate-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                    GET
                  </span>
                  <span className="text-slate-700">/api/v1/admin/stats</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg font-mono flex items-center gap-2">
                  <span className="bg-slate-200 text-slate-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                    GET
                  </span>
                  <span className="text-slate-700">/api/v1/admin/users</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg font-mono flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                    POST
                  </span>
                  <span className="text-slate-700">/api/v1/admin/users</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Memungkinkan AI Agent memantau metrik operasional secara real-time, memeriksa daftar pengguna, dan mengelola hak akses akun.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(sampleGetStatsCurl, "curl-stats")}
              className="btn-pill-secondary text-xs py-2 px-3 justify-center gap-1.5"
            >
              {copiedCurl === "curl-stats" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>cURL Tersalin</span>
                </>
              ) : (
                <>
                  <Code2 className="h-3.5 w-3.5" />
                  <span>Salin Contoh Request Stats</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
