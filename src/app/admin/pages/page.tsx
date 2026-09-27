import { getAllSitePagesAdmin } from "../../../server/queries";
import Link from "next/link";
import { Globe, Pencil, ExternalLink, Eye, EyeOff } from "lucide-react";

export default async function AdminPagesListPage() {
  const pages = await getAllSitePagesAdmin();

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Manajemen Halaman Standar (CMS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ubah isi konten, navigasi, dan SEO halaman utama tanpa perlu mengubah kode aplikasi.
          </p>
        </div>
      </div>

      <div className="card-diskon bg-white border border-slate-200 overflow-hidden divide-y divide-slate-100">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <div className="col-span-4">Nama Halaman & URL</div>
          <div className="col-span-4">Judul Halaman (H1)</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2 text-right">Aksi</div>
        </div>

        {pages.map((p) => {
          const publicUrl = p.key === "home" ? "/" : `/${p.slug}`;
          return (
            <div
              key={p.id}
              className="p-4 sm:px-6 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center hover:bg-slate-50/50 transition-colors"
            >
              <div className="sm:col-span-4 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-950">{p.name}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                    #{p.navOrder}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono block">{publicUrl}</span>
              </div>

              <div className="sm:col-span-4">
                <span className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-1">
                  {p.title}
                </span>
                {p.seoTitle && (
                  <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    SEO: {p.seoTitle}
                  </span>
                )}
              </div>

              <div className="sm:col-span-2 flex sm:justify-center">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    p.isPublished
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {p.isPublished ? (
                    <>
                      <Eye className="h-3 w-3 text-emerald-600" />
                      <span>Aktif</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 text-slate-400" />
                      <span>Nonaktif</span>
                    </>
                  )}
                </span>
              </div>

              <div className="sm:col-span-2 flex items-center justify-end gap-2">
                <Link
                  href={publicUrl}
                  target="_blank"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                  title="Lihat Halaman Publik"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>

                <Link
                  href={`/admin/pages/${p.key}/edit`}
                  className="btn-pill-primary text-xs py-1.5 px-3 flex items-center gap-1 font-semibold"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
