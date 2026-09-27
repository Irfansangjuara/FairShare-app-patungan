import { getAllArticlesAdmin } from "../../../server/queries";
import Link from "next/link";
import { Plus, FileText, Pencil, ExternalLink, Calendar, Trash2 } from "lucide-react";
import { DeleteArticleButton } from "./DeleteArticleButton";

export default async function AdminArticlesPage() {
  const articles = await getAllArticlesAdmin();

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Manajemen Artikel Blog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola publikasi artikel, SEO metadata, dan draft panduan pengguna.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="btn-pill-lime text-xs sm:text-sm py-2 sm:py-2.5 px-4 font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Tulis Artikel Baru</span>
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="card-diskon bg-white p-12 text-center max-w-md mx-auto border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Belum Ada Artikel</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Mulai tulis artikel pertama Anda untuk mendatangkan traffic pencarian organik Google.
          </p>
          <Link
            href="/admin/articles/new"
            className="btn-pill-lime text-xs py-2 px-4 inline-flex items-center gap-1.5 font-bold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tulis Artikel</span>
          </Link>
        </div>
      ) : (
        <div className="card-diskon bg-white border border-slate-200 overflow-hidden divide-y divide-slate-100">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <div className="col-span-6">Judul Artikel & Slug</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2">Penulis & Tanggal</div>
            <div className="col-span-2 text-right">Aksi</div>
          </div>

          {articles.map((art) => (
            <div
              key={art.id}
              className="p-4 sm:px-6 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center hover:bg-slate-50/50 transition-colors"
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
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                    title="Lihat Halaman Publik"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}

                <Link
                  href={`/admin/articles/${art.id}/edit`}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
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
