"use client";

import { useState, useTransition } from "react";
import { updateSiteSettingsAction } from "../server/actions/sitePage";
import { Save, Search, Share2, Globe, AlertCircle, CheckCircle } from "lucide-react";

interface GlobalSeoFormProps {
  initialSettings: {
    siteName: string;
    defaultDescription: string | null;
    defaultOgImage: string | null;
    titleTemplate: string;
  };
}

export function GlobalSeoForm({ initialSettings }: GlobalSeoFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [siteName, setSiteName] = useState(initialSettings.siteName);
  const [defaultDescription, setDefaultDescription] = useState(
    initialSettings.defaultDescription || ""
  );
  const [defaultOgImage, setDefaultOgImage] = useState(
    initialSettings.defaultOgImage || ""
  );
  const [titleTemplate, setTitleTemplate] = useState(
    initialSettings.titleTemplate || "%s | FairShare"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("siteName", siteName.trim());
    formData.append("defaultDescription", defaultDescription.trim());
    formData.append("defaultOgImage", defaultOgImage.trim());
    formData.append("titleTemplate", titleTemplate.trim());

    startTransition(async () => {
      const res = await updateSiteSettingsAction(null, formData);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg("Pengaturan SEO global berhasil diperbarui!");
      }
    });
  };

  const previewTitle = titleTemplate.replace("%s", "Aplikasi Patungan & Pelunasan Cerdas");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Inputs (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-diskon bg-white p-6 sm:p-8 border border-slate-200 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Website (Brand Name) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Ditampilkan pada navbar, footer, metadata title, dan skema branding.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Format Template Judul Halaman (Title Template) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={titleTemplate}
                onChange={(e) => setTitleTemplate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Gunakan <code>%s</code> sebagai placeholder judul halaman aktif. Contoh: <code>%s | FairShare</code>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Deskripsi Meta Default Website
              </label>
              <textarea
                rows={3}
                value={defaultDescription}
                onChange={(e) => setDefaultDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400 leading-relaxed"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Deskripsi cadangan bila halaman tertentu tidak memiliki meta description spesifik.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                URL Gambar Open Graph Default (Social Card)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={defaultOgImage}
                onChange={(e) => setDefaultOgImage(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Gambar rasio 1.91:1 (rekomendasi 1200x630 px) saat tautan dibagikan di WhatsApp, Twitter, Telegram, LinkedIn.
              </span>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="btn-pill-lime text-xs sm:text-sm py-2.5 px-6 font-bold flex items-center gap-2 shadow-md"
              >
                <Save className="h-4 w-4" />
                <span>{isPending ? "Menyimpan..." : "Simpan Pengaturan SEO"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Previews (1 col) */}
        <div className="space-y-6">
          {/* Live Google Search Preview */}
          <div className="card-diskon bg-white p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 border-b pb-2">
              <Search className="h-4 w-4 text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Pratinjau Hasil Google SERP
              </h4>
            </div>

            <div className="bg-[#f8f9fa] p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1 text-[11px] text-[#202124] truncate">
                <span className="font-semibold">fairshare.copilotmarketing.id</span>
              </div>
              <h5 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                {previewTitle}
              </h5>
              <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                {defaultDescription || "Kalkulator patungan dan pembagian pengeluaran bersama cerdas tanpa sisa rupiah."}
              </p>
            </div>
          </div>

          {/* Live Social Share Card Preview */}
          <div className="card-diskon bg-white p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 border-b pb-2">
              <Share2 className="h-4 w-4 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Pratinjau Tautan Media Sosial
              </h4>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              {defaultOgImage ? (
                <div className="aspect-[1.91/1] w-full overflow-hidden bg-slate-100">
                  <img
                    src={defaultOgImage}
                    alt="OG Preview"
                    className="w-full h-full object-cover"
                    onError={() => {}}
                  />
                </div>
              ) : (
                <div className="aspect-[1.91/1] w-full bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-[#b7e913] text-lg font-bold">{siteName}</span>
                  <span className="text-slate-400 text-xs mt-1">Patungan Cerdas Tanpa Ribet</span>
                </div>
              )}
              <div className="p-3 bg-slate-50 space-y-1 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  fairshare.copilotmarketing.id
                </span>
                <h6 className="text-xs font-bold text-slate-900 line-clamp-1">{siteName}</h6>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                  {defaultDescription || "Kalkulator patungan trip cerdas."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
