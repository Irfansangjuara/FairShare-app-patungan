import { db } from "../../db";
import { users, events, expenses, articles, sitePages } from "../../db/schema";
import { sql } from "drizzle-orm";
import Link from "next/link";
import {
  FileText,
  Globe,
  Settings,
  Users,
  Calendar,
  Receipt,
  Plus,
  ArrowRight,
  ShieldCheck,
  Search,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
  const [eventCount] = await db.select({ count: sql<number>`count(*)::int` }).from(events);
  const [expenseCount] = await db.select({ count: sql<number>`count(*)::int` }).from(expenses);
  const [articleCount] = await db.select({ count: sql<number>`count(*)::int` }).from(articles);
  const [pageCount] = await db.select({ count: sql<number>`count(*)::int` }).from(sitePages);

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="card-diskon bg-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-[#b7e913]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Pusat Kendali Administrasi FairShare</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang di Panel Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Kelola artikel blog publik, konten halaman standar tanpa ubah kode, optimasi SEO Google, dan pantau seluruh metrik operasional aplikasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/articles/new"
            className="btn-pill-lime text-xs sm:text-sm py-2 sm:py-2.5 px-4 font-bold flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Tulis Artikel Baru</span>
          </Link>
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>Kelola Halaman CMS</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-5">
        <div className="card-diskon p-4 sm:p-5 bg-white border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider">Artikel</span>
            <FileText className="h-4 w-4 text-lime-600" />
          </div>
          <p className="text-xl sm:text-3xl font-bold font-mono-numbers text-slate-900">
            {articleCount?.count || 0}
          </p>
          <Link href="/admin/articles" className="text-[11px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 pt-1 font-semibold">
            <span>Kelola artikel</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="card-diskon p-4 sm:p-5 bg-white border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider">Halaman CMS</span>
            <Globe className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-3xl font-bold font-mono-numbers text-slate-900">
            {pageCount?.count || 0}
          </p>
          <Link href="/admin/pages" className="text-[11px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 pt-1 font-semibold">
            <span>Edit halaman</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="card-diskon p-4 sm:p-5 bg-white border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider">Total User</span>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-3xl font-bold font-mono-numbers text-slate-900">
            {userCount?.count || 0}
          </p>
          <span className="text-[11px] text-slate-400 block pt-1">Pengguna terdaftar</span>
        </div>

        <div className="card-diskon p-4 sm:p-5 bg-white border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider">Total Event</span>
            <Calendar className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xl sm:text-3xl font-bold font-mono-numbers text-slate-900">
            {eventCount?.count || 0}
          </p>
          <span className="text-[11px] text-slate-400 block pt-1">Campaign patungan</span>
        </div>

        <div className="card-diskon p-4 sm:p-5 bg-white border border-slate-200 space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-medium uppercase tracking-wider">Transaksi</span>
            <Receipt className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-3xl font-bold font-mono-numbers text-slate-900">
            {expenseCount?.count || 0}
          </p>
          <span className="text-[11px] text-slate-400 block pt-1">Total pengeluaran</span>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-diskon p-6 bg-white border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-lime-100 text-lime-950 flex items-center justify-center font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Manajemen Artikel Blog</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tulis konten edukasi, artikel SEO-friendly, kelola status draft/published, ringkasan, dan gambar unggulan.
            </p>
          </div>
          <Link
            href="/admin/articles"
            className="btn-pill-primary text-xs py-2 px-4 justify-between"
          >
            <span>Buka Daftar Artikel</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="card-diskon p-6 bg-white border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-950 flex items-center justify-center font-bold">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Halaman Standar CMS</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Edit langsung teks Beranda, Tentang Kami, Kontak, Kebijakan Privasi, dan Syarat & Ketentuan tanpa perlu menyentuh kode.
            </p>
          </div>
          <Link
            href="/admin/pages"
            className="btn-pill-primary text-xs py-2 px-4 justify-between"
          >
            <span>Buka Editor Halaman</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="card-diskon p-6 bg-white border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-950 flex items-center justify-center font-bold">
              <Settings className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Pengaturan SEO Global</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Konfigurasi judul template Google (%s | FairShare), deskripsi default, meta Open Graph share card, dan pratinjau SERP.
            </p>
          </div>
          <Link
            href="/admin/seo"
            className="btn-pill-primary text-xs py-2 px-4 justify-between"
          >
            <span>Kelola SEO Global</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
