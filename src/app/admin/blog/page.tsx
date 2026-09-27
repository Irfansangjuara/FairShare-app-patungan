import { getAllArticlesAdmin } from "@/server/queries";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { Plus, FileText, Pencil, ExternalLink, Calendar, Trash2, ArrowLeft, Globe } from "lucide-react";
import { DeleteArticleButton } from "./DeleteArticleButton";

export const metadata = {
  title: "Manajemen Artikel Blog | Admin FairShare",
  description: "Kelola artikel blog publik, optimasi SEO Google, dan publikasikan panduan finansial.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminBlogPage() {
  await requireAdmin();
  const articles = await getAllArticlesAdmin();

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Overview</span>
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2.5">
            <span>Manajemen Artikel Blog</span>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-700">
              {articles.length}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500">
            Kelola artikel blog publik yang tersinkronisasi otomatis dengan halaman publik{" "}
            <Link href="/blog" target="_blank" className="text-slate-900 font-semibold underline underline-offset-2">
              /blog
            </Link>
            . Semua artikel mengikuti standar SEO Google (Schema BlogPosting, canonical, & SERP meta).
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/blog"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
          >
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <span>Lihat Halaman /blog</span>
          </Link>

          <Link
            href="/admin/blog/new"
            className="btn-pill-lime text-xs sm:text-sm py-2 sm:py-2.5 px-4 font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Tulis Artikel Baru</span>
          </Link>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="card-diskon bg-white p-12 text-center max-w-md mx-auto border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Belum Ada Artikel Blog</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
            Mulai tulis artikel pertama Anda untuk mendatangkan traffic organik Google dan mengedukasi pengguna FairShare.
          </p>
          <Link
            href="/admin/blog/new"
            className="btn-pill-lime text-xs py-2 px-4 inline-flex items-center gap-1.5 font-bold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tulis Artikel Sekarang</span>
          </Link>
        </div>
      ) : (
        <div className="card-diskon bg-white border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
            <div className="col-span-6">Judul Artikel & Slug Publik</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2">Penulis & Tanggal</div>
            <div className="col-span-2 text-right">Tindakan</div>
          </div>

          {articles.map((art) => (
            <div
              key={art.id}
              className="p-4 sm:px-6 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center hover:bg-slate-50/70 transition-colors"
            >
              <div className="sm:col-span-6 space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-slate-950 line-clamp-1">
                  {art.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>/blog/{art.slug}</span>
                  {art.isNoindex && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      noindex
                    </span>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2 flex sm:justify-center">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    art.status === "published"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      art.status === "published" ? "bg-emerald-600" : "bg-slate-400"
                    }`}
                  />
                  <span>{art.status === "published" ? "Published" : "Draft"}</span>
                </span>
              </div>

              <div className="sm:col-span-2 text-xs text-slate-500 space-y-0.5">
                <span className="block font-medium text-slate-700 truncate">
                  {art.author?.name || "Admin"}
                </span>
                <span className="block text-[11px] text-slate-400">
                  {art.publishedAt
                    ? new Date(art.publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : new Date(art.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                </span>
              </div>

              <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
                {art.status === "published" && (
                  <Link
                    href={`/blog/${art.slug}`}
                    target="_blank"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Buka Halaman Publik (/blog/...)"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}

                <Link
                  href={`/admin/blog/${art.id}/edit`}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  title="Edit Artikel"
                >
                  <Pencil className="h-4 w-4" />
                </Link>

                <DeleteArticleButton articleId={art.id} articleTitle={art.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
