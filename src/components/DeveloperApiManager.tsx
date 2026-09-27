"use client";

import { useState, useTransition } from "react";
import {
  createApiTokenAction,
  revokeApiTokenAction,
  rotateApiTokenAction,
} from "../server/actions/apiToken";
import {
  Key,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Shield,
  Code,
  Terminal,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

interface ApiTokenItem {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  lastUsedAt: Date | string | null;
  expiresAt: Date | string | null;
  isRevoked: boolean;
  createdAt: Date | string;
}

interface DeveloperApiManagerProps {
  tokens: ApiTokenItem[];
}

export function DeveloperApiManager({ tokens: initialTokens }: DeveloperApiManagerProps) {
  const [tokens, setTokens] = useState<ApiTokenItem[]>(initialTokens);
  const [isPending, startTransition] = useTransition();

  // Create token dialog states
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "read:campaigns",
    "write:expenses",
    "read:settlements",
  ]);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<{
    token: string;
    name: string;
  } | null>(null);

  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedSnippet(id);
      setTimeout(() => setCopiedSnippet(null), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleToggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      if (selectedScopes.length > 1) {
        setSelectedScopes(selectedScopes.filter((s) => s !== scope));
      }
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName.trim()) return;

    startTransition(async () => {
      const res = await createApiTokenAction(tokenName.trim(), selectedScopes);
      if (res.success && res.rawToken) {
        setNewlyCreatedToken({
          token: res.rawToken,
          name: res.tokenName || tokenName,
        });
        setIsOpenCreate(false);
        setTokenName("");
        // Optimistic refresh
        setTokens((prev) => [
          {
            id: `temp-${Date.now()}`,
            name: res.tokenName || tokenName,
            tokenPrefix: `${res.rawToken?.slice(0, 14)}...`,
            scopes: selectedScopes,
            lastUsedAt: null,
            expiresAt: null,
            isRevoked: false,
            createdAt: new Date(),
          },
          ...prev,
        ]);
      } else if (res.error) {
        alert(res.error);
      }
    });
  };

  const handleRevoke = (tokenId: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin mencabut token "${name}"? Token ini tidak akan dapat digunakan lagi.`)) {
      startTransition(async () => {
        await revokeApiTokenAction(tokenId);
        setTokens((prev) =>
          prev.map((t) => (t.id === tokenId ? { ...t, isRevoked: true } : t))
        );
      });
    }
  };

  const handleRotate = (tokenId: string, name: string) => {
    if (confirm(`Rotasi token "${name}"? Token lama akan dicabut dan token rahasia baru akan dibuat.`)) {
      startTransition(async () => {
        const res = await rotateApiTokenAction(tokenId);
        if (res.success && res.rawToken) {
          setNewlyCreatedToken({
            token: res.rawToken,
            name: res.tokenName || name,
          });
          setTokens((prev) =>
            prev.map((t) => (t.id === tokenId ? { ...t, isRevoked: true } : t))
          );
        } else if (res.error) {
          alert(res.error);
        }
      });
    }
  };

  const availableScopes = [
    { id: "read:campaigns", label: "read:campaigns", desc: "Membaca ringkasan event dan daftar peserta" },
    { id: "write:expenses", label: "write:expenses", desc: "Mencatat transaksi pengeluaran baru" },
    { id: "read:settlements", label: "read:settlements", desc: "Melihat instruksi transfer pelunasan & status lunas" },
  ];

  return (
    <div className="space-y-10">
      {/* Newly Created Token Alert Modal/Banner */}
      {newlyCreatedToken && (
        <div className="card-diskon bg-slate-950 text-white p-6 border-2 border-lime-400 shadow-2xl animate-in zoom-in-95 space-y-4">
          <div className="flex items-center gap-2 text-lime-400">
            <CheckCircle className="h-5 w-5" />
            <h3 className="text-base font-bold">
              Token API Berhasil Dibuat: {newlyCreatedToken.name}
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            ⚠️ <strong>Simpan token ini sekarang di tempat yang aman.</strong> Demi keamanan, token ini hanya akan ditampilkan sekali ini dan tidak dapat dilihat lagi.
          </p>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <code className="text-xs font-mono text-[#b7e913] flex-1 break-all">
              {newlyCreatedToken.token}
            </code>
            <button
              onClick={() => handleCopy(newlyCreatedToken.token)}
              className="btn-pill-lime text-xs py-1.5 px-3 font-bold flex items-center gap-1 shrink-0"
            >
              {copiedToken ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin Token</span>
                </>
              )}
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setNewlyCreatedToken(null)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 font-semibold"
            >
              Saya sudah menyimpan token ini
            </button>
          </div>
        </div>
      )}

      {/* Section 1: Token Management Card */}
      <div className="card-diskon bg-white p-5 sm:p-8 border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-black text-[#b7e913] flex items-center justify-center font-bold">
                <Key className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                API Tokens untuk AI Agent
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Kelola token otentikasi Bearer dengan pembatasan hak akses (scopes) per agent eksternal.
            </p>
          </div>

          <button
            onClick={() => setIsOpenCreate(true)}
            className="btn-pill-lime text-xs sm:text-sm py-2 px-4 font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Token Baru</span>
          </button>
        </div>

        {tokens.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Belum ada API token yang dibuat. Klik tombol "Buat Token Baru" untuk menghubungkan AI agent Anda.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{token.name}</span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {token.tokenPrefix}
                    </span>
                    {token.isRevoked ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        Dicabut (Revoked)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Aktif
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {token.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>
                      Dibuat: {new Date(token.createdAt).toLocaleDateString("id-ID")}
                    </span>
                    {token.lastUsedAt && (
                      <span>
                        • Terakhir dipakai: {new Date(token.lastUsedAt).toLocaleDateString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>

                {!token.isRevoked && (
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleRotate(token.id, token.name)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-full font-medium transition-colors"
                      title="Rotasi Token (Ganti secret baru)"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Rotasi</span>
                    </button>
                    <button
                      onClick={() => handleRevoke(token.id, token.name)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-full font-medium transition-colors"
                      title="Cabut Akses Token"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Cabut</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Token Modal */}
      {isOpenCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="card-diskon w-full max-w-lg bg-white p-6 space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b pb-2">
              Buat API Token AI Agent Baru
            </h3>

            <form onSubmit={handleCreateToken} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Token / Nama Agent <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: AutoGen Finance Bot, CrewAI Assistant"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Pilih Permission Scopes (Minimal 1) <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {availableScopes.map((scope) => {
                    const isChecked = selectedScopes.includes(scope.id);
                    return (
                      <div
                        key={scope.id}
                        onClick={() => handleToggleScope(scope.id)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-colors ${
                          isChecked
                            ? "bg-slate-50 border-slate-900"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-lime-400"
                        />
                        <div className="space-y-0.5">
                          <code className="text-xs font-mono font-bold text-slate-900">
                            {scope.label}
                          </code>
                          <p className="text-[11px] text-slate-500">{scope.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpenCreate(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending || !tokenName.trim()}
                  className="btn-pill-lime text-xs py-2 px-5 font-bold"
                >
                  {isPending ? "Membuat..." : "Generate Token"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section 2: Interactive Documentation & Examples for AI Agents */}
      <div className="card-diskon bg-white p-5 sm:p-8 border border-slate-200 space-y-6">
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Code className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Dokumentasi REST API & Contoh AI Agent
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Panduan lengkap pemanggilan API oleh agent eksternal (cURL, Python, TypeScript) dengan spesifikasi response.
          </p>
        </div>

        {/* Authentication Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Header Autentikasi
          </h4>
          <p className="text-xs text-slate-600">
            Kirimkan token Anda melalui header HTTP standard Bearer:
          </p>
          <pre className="p-3 rounded-xl bg-slate-950 text-lime-400 font-mono text-xs overflow-x-auto">
            Authorization: Bearer fs_live_your_secret_token_here
          </pre>
        </div>

        {/* Endpoint 1: GET /api/v1/campaigns */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono font-bold text-xs">
              GET
            </span>
            <code className="text-xs sm:text-sm font-mono font-bold text-slate-900">
              /api/v1/campaigns
            </code>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
              scope: read:campaigns
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Mengambil daftar semua campaign patungan milik akun terotorisasi.
          </p>

          <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto">
{`curl -X GET "https://fairshare.copilotmarketing.id/api/v1/campaigns" \\
  -H "Authorization: Bearer fs_live_..."`}
          </pre>
        </div>

        {/* Endpoint 2: GET /api/v1/campaigns/:id */}
        <div className="space-y-2.5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono font-bold text-xs">
              GET
            </span>
            <code className="text-xs sm:text-sm font-mono font-bold text-slate-900">
              /api/v1/campaigns/:id
            </code>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
              scope: read:campaigns
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Mengambil detail lengkap event, peserta beserta nomor rekening, daftar pengeluaran, dan saldo bersih tiap peserta.
          </p>

          <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto">
{`curl -X GET "https://fairshare.copilotmarketing.id/api/v1/campaigns/EVENT_ID" \\
  -H "Authorization: Bearer fs_live_..."`}
          </pre>
        </div>

        {/* Endpoint 3: POST /api/v1/campaigns/:id/expenses */}
        <div className="space-y-2.5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">
              POST
            </span>
            <code className="text-xs sm:text-sm font-mono font-bold text-slate-900">
              /api/v1/campaigns/:id/expenses
            </code>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
              scope: write:expenses
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Mencatat pengeluaran baru ke dalam event. Setelah berhasil disimpan, instruksi pelunasan transfer dihitung ulang secara otomatis.
          </p>

          <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto">
{`curl -X POST "https://fairshare.copilotmarketing.id/api/v1/campaigns/EVENT_ID/expenses" \\
  -H "Authorization: Bearer fs_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Makan Malam Seafood Jimbaran",
    "category": "Konsumsi",
    "amount": 450000,
    "paidByMemberId": "MEMBER_UUID"
  }'`}
          </pre>
        </div>

        {/* Endpoint 4: GET /api/v1/campaigns/:id/settlements */}
        <div className="space-y-2.5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono font-bold text-xs">
              GET
            </span>
            <code className="text-xs sm:text-sm font-mono font-bold text-slate-900">
              /api/v1/campaigns/:id/settlements
            </code>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
              scope: read:settlements
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Mengambil rekomendasi transfer pelunasan tersederhana (siapa bayar siapa, berapa nominal rupiahnya, dan nomor rekening penerima).
          </p>

          <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto">
{`curl -X GET "https://fairshare.copilotmarketing.id/api/v1/campaigns/EVENT_ID/settlements" \\
  -H "Authorization: Bearer fs_live_..."`}
          </pre>
        </div>

        {/* AI Agent System Prompt Sample */}
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
          <div className="flex items-center gap-2 text-amber-900">
            <Terminal className="h-4 w-4 text-amber-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Contoh Petunjuk Prompt untuk AI Agent Anda (System Prompt)
            </h4>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Tempelkan instruksi ini pada LLM Agent Anda agar memahami cara memanggil endpoint FairShare:
          </p>
          <pre className="p-3.5 rounded-xl bg-white border border-amber-200 text-slate-800 font-mono text-[11px] overflow-x-auto leading-relaxed whitespace-pre-wrap">
{`Kamu adalah Financial Assistant yang terhubung ke FairShare API.
Saat pengguna meminta mencatat pengeluaran:
1. Panggil GET /api/v1/campaigns untuk menemukan EVENT_ID yang dimaksud.
2. Panggil GET /api/v1/campaigns/{EVENT_ID} untuk mencocokkan MEMBER_ID pembayar.
3. Konfirmasi nominal dalam Rupiah dan kirim POST /api/v1/campaigns/{EVENT_ID}/expenses.
4. Tampilkan kembali ringkasan transfer pelunasan terbaru kepada pengguna.`}
          </pre>
        </div>
      </div>
    </div>
  );
}
