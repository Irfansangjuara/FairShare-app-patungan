import { getSessionUser } from "@/lib/auth";
import { getAdminOverviewStats } from "@/server/queries";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import Link from "next/link";
import {
  FileText,
  Globe,
  Settings,
  Users,
  Calendar,
  Plus,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  ChevronRight,
  Bot,
} from "lucide-react";

export const metadata = {
  title: "Admin Panel | FairShare",
  description: "Pusat Kendali Administrasi FairShare - Manajemen Pengguna, Artikel Blog, CMS, dan SEO.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const user = await getSessionUser();

  // 1. If not logged in or not admin, show the Admin Login form right at /admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#b7e913]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full">
          <AdminLoginForm />
        </div>
      </div>
    );
  }

  // 2. If authenticated as admin, fetch stats & show full Admin Dashboard
  const stats = await getAdminOverviewStats();

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="card-diskon bg-slate-950 text-white p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#b7e913]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 px-3.5 py-1 text-xs font-semibold text-[#b7e913]">
            <ShieldCheck className="h-4 w-4" />
            <span>Pusat Kendali Administrasi &bull; Akses Super Admin</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Halo, <span className="text-[#b7e913]">{user.name}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Selamat datang di dashboard kontrol admin. Kelola akun pengguna, terbitkan artikel blog edukasi, sesuaikan halaman CMS, dan pantau seluruh operasional sistem FairShare.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <Link
            href="/admin/users"
            className="btn-pill-lime text-xs sm:text-sm py-2 sm:py-2.5 px-4 font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Users className="h-4 w-4" />
            <span>Kelola Pengguna</span>
          </Link>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Tulis Artikel</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950 hover:bg-slate-900 px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Web Publik</span>
          </Link>
        </div>
      </div>

      {/* Primary Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Users */}
        <div className="card-diskon p-5 bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Pengguna
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-950">
              {stats.totalUsers}
            </p>
            <span className="text-xs text-slate-400">akun</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-emerald-700 font-medium">
              {stats.adminCount} Admin &bull; {stats.regularUserCount} User
            </span>
            <Link
              href="/admin/users"
              className="text-slate-500 hover:text-slate-900 inline-flex items-center gap-0.5 font-bold"
            >
              <span>Kelola</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Total Articles */}
        <div className="card-diskon p-5 bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Artikel Blog
            </span>
            <div className="w-8 h-8 rounded-xl bg-lime-50 text-lime-700 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-950">
              {stats.totalArticles}
            </p>
            <span className="text-xs text-slate-400">postingan</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-lime-700 font-medium">
              {stats.publishedArticleCount} Tayang &bull; {stats.draftArticleCount} Draft
            </span>
            <Link
              href="/admin/blog"
              className="text-slate-500 hover:text-slate-900 inline-flex items-center gap-0.5 font-bold"
            >
              <span>Lihat</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* CMS Pages */}
        <div className="card-diskon p-5 bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Halaman Standar
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-950">
              {stats.totalPages}
            </p>
            <span className="text-xs text-slate-400">halaman CMS</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-blue-700 font-medium">Beranda, Tentang, Privasi...</span>
            <Link
              href="/admin/pages"
              className="text-slate-500 hover:text-slate-900 inline-flex items-center gap-0.5 font-bold"
            >
              <span>Edit</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Events / Patungan */}
        <div className="card-diskon p-5 bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Event Patungan
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-950">
              {stats.totalEvents}
            </p>
            <span className="text-xs text-slate-400">campaign</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-purple-700 font-medium">Aktif di seluruh pengguna</span>
            <Link
              href="/admin/seo"
              className="text-slate-500 hover:text-slate-900 inline-flex items-center gap-0.5 font-bold"
            >
              <span>SEO</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Users & Recent Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users Section */}
        <div className="card-diskon bg-white border border-slate-200 p-6 flex flex-col justify-between space-y-5 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-950">
                    Pengguna Terbaru
                  </h3>
                  <p className="text-xs text-slate-500">
                    Akun terdaftar dan role sistem
                  </p>
                </div>
              </div>
              <Link
                href="/admin/users"
                className="text-xs font-bold text-slate-700 hover:text-black inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {stats.recentUsers.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Belum ada pengguna terdaftar.</p>
            ) : (
              <div className="space-y-2.5">
                {stats.recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-[#b7e913] flex items-center justify-center font-bold text-xs shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-950 truncate">
                          {u.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate font-mono">
                          {u.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {u.role === "admin" ? "Admin" : "User"}
                      </span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        {u.eventCount} event
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/admin/users"
            className="btn-pill-primary text-xs py-2 px-4 justify-center"
          >
            <span>Buka Manajemen Pengguna</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Recent Articles Section */}
        <div className="card-diskon bg-white border border-slate-200 p-6 flex flex-col justify-between space-y-5 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-lime-100 text-lime-900 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-950">
                    Artikel Blog Terbaru
                  </h3>
                  <p className="text-xs text-slate-500">
                    Publikasi konten & status SEO
                  </p>
                </div>
              </div>
              <Link
                href="/admin/blog"
                className="text-xs font-bold text-slate-700 hover:text-black inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {stats.recentArticles.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Belum ada artikel yang dibuat.</p>
            ) : (
              <div className="space-y-2.5">
                {stats.recentArticles.map((art) => (
                  <div
                    key={art.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 transition-colors"
                  >
                    <div className="min-w-0 pr-3 space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-slate-950 truncate">
                        {art.title}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        /blog/{art.slug}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          art.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {art.status === "published" ? "Tayang" : "Draft"}
                      </span>
                      <Link
                        href={`/admin/blog/${art.id}/edit`}
                        className="text-xs font-bold text-slate-600 hover:text-black p-1 hover:bg-slate-200 rounded"
                        title="Edit artikel"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/blog/new"
              className="btn-pill-lime text-xs py-2 px-4 flex-1 justify-center"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tulis Artikel Baru</span>
            </Link>
            <Link
              href="/admin/blog"
              className="btn-pill-secondary text-xs py-2 px-4 justify-center"
            >
              <span>Semua Artikel</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Fast Navigation Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="card-diskon p-5 bg-white border border-slate-200 flex flex-col justify-between space-y-3 shadow-sm hover:border-slate-300 transition-all">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-950">Manajemen Pengguna</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Atur hak akses admin/user, reset password pengguna, dan audit keanggotaan.
            </p>
          </div>
          <Link
            href="/admin/users"
            className="text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 pt-1"
          >
            <span>Buka Pengguna</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="card-diskon p-5 bg-white border border-slate-200 flex flex-col justify-between space-y-3 shadow-sm hover:border-slate-300 transition-all">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-lime-100 text-lime-950 flex items-center justify-center font-bold">
              <FileText className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-950">Artikel Blog & SEO</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tulis konten edukasi baru dan publikasikan panduan finansial di /blog.
            </p>
          </div>
          <Link
            href="/admin/blog"
            className="text-xs font-bold text-lime-800 hover:text-black inline-flex items-center gap-1 pt-1"
          >
            <span>Kelola Artikel</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="card-diskon p-5 bg-white border border-slate-200 flex flex-col justify-between space-y-3 shadow-sm hover:border-slate-300 transition-all">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-950 flex items-center justify-center font-bold">
              <Bot className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-950">AI Agent & API Token</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kredensial token untuk AI Agent mengupdate artikel dan memantau dashboard.
            </p>
          </div>
          <Link
            href="/admin/agent"
            className="text-xs font-bold text-emerald-800 hover:text-black inline-flex items-center gap-1 pt-1"
          >
            <span>Buka AI Agent</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="card-diskon p-5 bg-white border border-slate-200 flex flex-col justify-between space-y-3 shadow-sm hover:border-slate-300 transition-all">
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
              <Globe className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-950">Halaman Standar CMS</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sesuaikan teks halaman publik Beranda, Tentang Kami, Privasi, & Syarat.
            </p>
          </div>
          <Link
            href="/admin/pages"
            className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 pt-1"
          >
            <span>Buka Editor CMS</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
