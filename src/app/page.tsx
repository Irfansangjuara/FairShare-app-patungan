import Link from "next/link";
import { getSessionUser } from "../lib/auth";
import { Navbar } from "../components/Navbar";
import {
  Wallet,
  ArrowRight,
  CheckCircle2,
  Copy,
  Receipt,
  Users,
  ShieldCheck,
  Smartphone,
} from "lucide-react";


export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC]">
      <Navbar user={user} />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#b7e913] animate-pulse" />
              <span>Aplikasi Patungan & Pelunasan Generasi Baru</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.15]">
              Bereskan Patungan Trip{" "}
              <span className="bg-gradient-to-r from-slate-950 via-slate-800 to-slate-600 bg-clip-text text-transparent">
                Tanpa Bingung & Spreadsheet
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
              FairShare mengubah catatan pengeluaran grup yang tercecer menjadi satu jawaban pasti:{" "}
              <strong>siapa membayar siapa, berapa nominal rupiahnya, dan apakah sudah lunas</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-3 w-full max-w-sm sm:max-w-none sm:w-auto mx-auto">
              {user ? (
                <Link
                  href="/dashboard"
                  className="btn-pill-lime text-sm sm:text-base py-3 sm:py-3.5 px-6 sm:px-8 font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 sm:w-auto"
                >
                  <span className="whitespace-nowrap">Buka Dashboard Event</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="btn-pill-lime text-sm sm:text-base py-3 sm:py-3.5 px-6 sm:px-8 font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 sm:w-auto"
                  >
                    <span className="whitespace-nowrap">Mulai Sekarang — Gratis</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-slate-800 shadow-sm transition-all active:scale-[0.99] whitespace-nowrap shrink-0 sm:w-auto"
                  >
                    <svg
                      className="h-5 w-5 shrink-0"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span className="whitespace-nowrap">Masuk Akun</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Interactive Benchmark Mockup / Live Preview */}
          <div className="mx-auto max-w-3xl mt-10 sm:mt-16">
            <div className="card-diskon border-2 border-slate-200 bg-white p-4 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 sm:pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Simulasi Contoh Riil (PRD Benchmark)
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                    Liburan Jogja Bersama 🏖️
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-[11px] sm:text-xs text-slate-600 font-medium">Total Pengeluaran</div>
                  <div className="text-lg sm:text-xl font-bold font-mono-numbers text-slate-950">
                    Rp 934.000
                  </div>
                </div>
              </div>

              {/* Members distribution & settlements preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-4 sm:py-5 border-b border-slate-100">
                <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50">
                  <span className="text-xs text-slate-600 block">Andri</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm font-mono-numbers">
                    Bayar 385k
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 block">
                    +Rp 151.500
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50">
                  <span className="text-xs text-slate-600 block">Tedy</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm font-mono-numbers">
                    Bayar 284k
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 block">
                    +Rp 50.500
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50">
                  <span className="text-xs text-slate-600 block">Irfan</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm font-mono-numbers">
                    Bayar 200k
                  </span>
                  <span className="text-[11px] font-semibold text-rose-700 block">
                    -Rp 33.500
                  </span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50">
                  <span className="text-xs text-slate-600 block">Rion</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm font-mono-numbers">
                    Bayar 65k
                  </span>
                  <span className="text-[11px] font-semibold text-rose-700 block">
                    -Rp 168.500
                  </span>
                </div>
              </div>

              {/* Settlement Transfer Result */}
              <div className="pt-4 sm:pt-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-600 tracking-wider">
                    Hasil Rekomendasi Transfer Sederhana
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 self-start sm:self-auto">
                    Jatah Masing-masing Rp 233.500
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs sm:text-sm font-semibold text-slate-900">
                      1. Rion ➡️ Andri
                    </span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="font-mono-numbers font-bold text-xs sm:text-sm text-slate-900">
                        Rp 151.500
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Lunas ✓
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs sm:text-sm font-semibold text-slate-900">
                      2. Irfan ➡️ Tedy
                    </span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="font-mono-numbers font-bold text-xs sm:text-sm text-slate-900">
                        Rp 33.500
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        Belum Lunas
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs sm:text-sm font-semibold text-slate-900">
                      3. Rion ➡️ Tedy
                    </span>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="font-mono-numbers font-bold text-xs sm:text-sm text-slate-900">
                        Rp 17.000
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        Belum Lunas
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Feature Highlights Section */}
        <section className="py-16 border-t border-slate-200/80 bg-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                Fitur Lengkap Sesuai Kebutuhan Nyata
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Didesain khusus untuk trip teman kantor, liburan keluarga, maupun kepanitiaan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-diskon p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-[#b7e913]">
                  <Receipt className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Pembagian Beban Adil & Presisi</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Semua nominal dihitung murni dalam integer Rupiah. Bila ada sisa rupiah yang tidak
                  habis dibagi, dialokasikan deterministik tanpa kehilangan Rp 1 pun.
                </p>
              </div>

              <div className="card-diskon p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-[#b7e913]">
                  <Copy className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Rekap Siap Kirim ke WhatsApp</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cukup satu tombol, teks rekap rapi siap ditempel di grup chat tanpa perlu repot
                  mengetik ulang nama dan nomor transfer.
                </p>
              </div>

              <div className="card-diskon p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-[#b7e913]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Checklist Pelunasan Tersimpan</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tandai siapa yang sudah melunasi transfer. Status pelunasan persisten di database
                  dan tidak akan hilang saat halaman dimuat ulang.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-4 text-center text-xs text-slate-600 font-medium">
        <p>FairShare © {new Date().getFullYear()} — Aplikasi Patungan & Pelunasan Cerdas</p>
      </footer>
    </div>
  );
}
