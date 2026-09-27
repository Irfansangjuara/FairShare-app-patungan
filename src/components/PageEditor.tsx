"use client";

import { useState, useTransition } from "react";
import { updateSitePageAction } from "../server/actions/sitePage";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Globe,
  Search,
  ExternalLink,
  Share2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface PageEditorProps {
  page: {
    key: string;
    name: string;
    slug: string;
    title: string;
    content: string;
    featuredImage: string | null;
    isPublished: boolean;
    navOrder: number;
    seoTitle: string | null;
    seoDescription: string | null;
    canonicalUrl: string | null;
    isNoindex: boolean;
    ogImage: string | null;
    ogDescription: string | null;
  };
}

export function PageEditor({ page }: PageEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(page.name);
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [featuredImage, setFeaturedImage] = useState(page.featuredImage || "");
  const [isPublished, setIsPublished] = useState(page.isPublished);
  const [navOrder, setNavOrder] = useState(page.navOrder);

  // SEO states
  const [seoTitle, setSeoTitle] = useState(page.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(page.seoDescription || "");
  const [canonicalUrl, setCanonicalUrl] = useState(page.canonicalUrl || "");
  const [isNoindex, setIsNoindex] = useState(page.isNoindex);
  const [ogImage, setOgImage] = useState(page.ogImage || "");
  const [ogDescription, setOgDescription] = useState(page.ogDescription || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("title", title.trim());
    formData.append("content", content.trim());
    formData.append("featuredImage", featuredImage.trim());
    formData.append("isPublished", isPublished ? "true" : "false");
    formData.append("navOrder", navOrder.toString());
    formData.append("seoTitle", seoTitle.trim());
    formData.append("seoDescription", seoDescription.trim());
    formData.append("canonicalUrl", canonicalUrl.trim());
    formData.append("isNoindex", isNoindex ? "true" : "false");
    formData.append("ogImage", ogImage.trim());
    formData.append("ogDescription", ogDescription.trim());

    startTransition(async () => {
      const res = await updateSitePageAction(page.key, null, formData);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg("Konten halaman dan SEO berhasil disimpan!");
        setTimeout(() => {
          router.push("/admin/pages");
        }, 1200);
      }
    });
  };

  const previewTitle = seoTitle.trim() || title || "Judul Halaman";
  const previewDesc =
    seoDescription.trim() ||
    ogDescription.trim() ||
    content.slice(0, 150) ||
    "Deskripsi halaman untuk tampilan di mesin pencari Google...";
  const publicUrl = page.key === "home" ? "/" : `/${page.slug}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Daftar Halaman</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            href={publicUrl}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Lihat Halaman Publik</span>
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="btn-pill-lime text-xs sm:text-sm py-2 px-5 font-bold shadow-md flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            <span>{isPending ? "Menyimpan..." : "Simpan Halaman"}</span>
          </button>
        </div>
      </div>

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
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-diskon bg-white p-5 sm:p-7 border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Halaman (Navigasi) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  disabled
                  value={`/${page.slug}`}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-sm font-mono text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Judul Halaman (H1) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base font-bold focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Isi Konten Halaman <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={16}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-lime-400 leading-relaxed"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Gunakan format teks rapi: heading (### Subjudul), list (- Poin), atau paragraf dengan baris baru ganda.
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar: SEO Metadata & Previews (1 col) */}
        <div className="space-y-6">
          {/* Status & Navigation */}
          <div className="card-diskon bg-white p-5 border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-2">
              Status & Navigasi
            </h4>

            <div className="flex items-center justify-between">
              <label htmlFor="isPublished" className="text-xs font-semibold text-slate-700">
                Status Publikasi
              </label>
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urutan Menu Navigasi
              </label>
              <input
                type="number"
                value={navOrder}
                onChange={(e) => setNavOrder(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Gambar Utama (Opsional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>
          </div>

          {/* SEO Metadata Settings */}
          <div className="card-diskon bg-white p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-1.5 border-b pb-2">
              <Globe className="h-4 w-4 text-lime-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                SEO Metadata Halaman
              </h4>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                placeholder="Contoh: Tentang FairShare | Patungan Cerdas"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Description
              </label>
              <textarea
                rows={3}
                placeholder="Deskripsi untuk snippet hasil pencarian Google..."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Gambar Open Graph (Media Sosial)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi Open Graph
              </label>
              <textarea
                rows={2}
                placeholder="Deskripsi saat link dibagikan di WA/Twitter/Facebook..."
                value={ogDescription}
                onChange={(e) => setOgDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div className="pt-2 border-t flex items-center gap-2">
              <input
                type="checkbox"
                id="isNoindexPage"
                checked={isNoindex}
                onChange={(e) => setIsNoindex(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-lime-400"
              />
              <label htmlFor="isNoindexPage" className="text-xs text-slate-700 font-medium">
                Sembunyikan dari Google (noindex)
              </label>
            </div>
          </div>

          {/* Live Google Search Preview (Requirement #6) */}
          <div className="card-diskon bg-white p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 border-b pb-2">
              <Search className="h-4 w-4 text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Pratinjau Hasil Pencarian Google
              </h4>
            </div>

            <div className="bg-[#f8f9fa] p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1 text-[11px] text-[#202124] truncate">
                <span className="font-semibold">fairshare.copilotmarketing.id</span>
                <span className="text-slate-400">› {page.slug}</span>
              </div>
              <h5 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                {previewTitle} | FairShare
              </h5>
              <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                {previewDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
