"use client";

import { useState, useTransition } from "react";
import { createArticleAction, updateArticleAction } from "../server/actions/article";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Globe,
  Eye,
  Search,
  ExternalLink,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface ArticleEditorProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    content: string;
    featuredImage: string | null;
    status: string;
    seoTitle: string | null;
    seoDescription: string | null;
    canonicalUrl: string | null;
    isNoindex: boolean;
  } | null;
}

export function ArticleEditor({ initialData }: ArticleEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isCustomSlug, setIsCustomSlug] = useState(Boolean(initialData?.slug));
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || "");
  const [status, setStatus] = useState<"draft" | "published">(
    (initialData?.status as "draft" | "published") || "draft"
  );

  // SEO states
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || "");
  const [isNoindex, setIsNoindex] = useState(initialData?.isNoindex || false);

  // Slug generator
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isCustomSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);
      setSlug(generated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("slug", slug.trim());
    formData.append("summary", summary.trim());
    formData.append("content", content.trim());
    formData.append("featuredImage", featuredImage.trim());
    formData.append("status", status);
    formData.append("seoTitle", seoTitle.trim());
    formData.append("seoDescription", seoDescription.trim());
    formData.append("canonicalUrl", canonicalUrl.trim());
    formData.append("isNoindex", isNoindex ? "true" : "false");

    startTransition(async () => {
      let res;
      if (initialData?.id) {
        res = await updateArticleAction(initialData.id, null, formData);
      } else {
        res = await createArticleAction(null, formData);
      }

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(
          status === "published"
            ? "Artikel berhasil dipublikasikan!"
            : "Draft artikel berhasil disimpan!"
        );
        setTimeout(() => {
          router.push("/admin/blog");
        }, 1200);
      }
    });
  };

  // Previews
  const previewTitle = seoTitle.trim() || title || "Judul Artikel";
  const previewDesc =
    seoDescription.trim() ||
    summary ||
    content.slice(0, 150) ||
    "Deskripsi ringkas artikel untuk tampilan hasil pencarian Google...";
  const previewSlug = slug || "contoh-slug-artikel";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Daftar Artikel</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {initialData?.slug && initialData.status === "published" && (
            <Link
              href={`/blog/${initialData.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Lihat Publik</span>
            </Link>
          )}

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="rounded-full border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            <option value="draft">Draft (Tersimpan Privat)</option>
            <option value="published">Published (Publikasikan)</option>
          </select>

          <button
            type="submit"
            disabled={isPending}
            className="btn-pill-lime text-xs sm:text-sm py-2 px-5 font-bold shadow-md flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            <span>{isPending ? "Menyimpan..." : "Simpan Artikel"}</span>
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
        {/* Main Content Fields (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-diskon bg-white p-5 sm:p-7 border border-slate-200 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Judul Artikel <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 7 Tips Mengatur Patungan Liburan Bareng Teman Tanpa Selisih"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base font-bold focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Slug URL (SEO-friendly) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">/blog/</span>
                <input
                  type="text"
                  required
                  placeholder="tips-mengatur-patungan-liburan"
                  value={slug}
                  onChange={(e) => {
                    setIsCustomSlug(true);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  }}
                  className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ringkasan Singkat (Summary)
              </label>
              <textarea
                rows={2}
                placeholder="Deskripsi singkat yang menggugah untuk ditampilkan pada kartu artikel di daftar blog..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Isi Konten Artikel <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={14}
                required
                placeholder="Tulis artikel di sini. Anda dapat menggunakan heading (## atau ###), paragraf terpisah, dan list (- item)..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-lime-400 leading-relaxed"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Mendukung paragraf, subjudul (## Subjudul, ### Poin), dan daftar (- Poin).
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar: SEO Metadata & Previews (1 col) */}
        <div className="space-y-6">
          {/* Featured Image & Publishing Status */}
          <div className="card-diskon bg-white p-5 border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-2">
              Gambar Unggulan
            </h4>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Gambar Utama
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            {featuredImage && (
              <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-50">
                <img
                  src={featuredImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setErrorMsg("URL gambar tidak dapat dimuat")}
                />
              </div>
            )}
          </div>

          {/* SEO Metadata Settings */}
          <div className="card-diskon bg-white p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-1.5 border-b pb-2">
              <Globe className="h-4 w-4 text-lime-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Pengaturan SEO Artikel
              </h4>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SEO Title (Judul Google)
              </label>
              <input
                type="text"
                placeholder="Biarkan kosong untuk memakai judul artikel"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Panjang ideal: 50–60 karakter ({previewTitle.length} karakter)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Description
              </label>
              <textarea
                rows={3}
                placeholder="Deskripsi yang muncul di bawah judul di hasil pencarian..."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Panjang ideal: 120–160 karakter ({previewDesc.length} karakter)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Canonical URL (Opsional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div className="pt-2 border-t flex items-center gap-2">
              <input
                type="checkbox"
                id="isNoindex"
                checked={isNoindex}
                onChange={(e) => setIsNoindex(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-lime-400"
              />
              <label htmlFor="isNoindex" className="text-xs text-slate-700 font-medium">
                Cegah Google Mengindeks Halaman Ini (noindex)
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
                <span className="text-slate-400">› blog › {previewSlug}</span>
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
