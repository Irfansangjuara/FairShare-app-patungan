import Link from "next/link";
import { Wallet, Heart } from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white pt-12 pb-8 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-[#b7e913] shadow-xs">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-950">FairShare</span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Platform patungan dan pelunasan pengeluaran trip cerdas dengan perhitungan presisi integer rupiah tanpa selisih.
            </p>
          </div>

          {/* Links 1: Navigasi */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Navigasi</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/" className="hover:text-slate-950 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-slate-950 transition-colors">
                  Blog & Artikel
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-slate-950 transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-slate-950 transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2: Legalitas & Privasi */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Legalitas</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/privacy" className="hover:text-slate-950 transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-950 transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 3: Pengembang & AI */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Integrasi</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/developer" className="hover:text-slate-950 transition-colors">
                  AI Agent API Docs
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-slate-950 transition-colors">
                  Masuk Akun
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-slate-950 transition-colors">
                  Daftar Gratis
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {currentYear} FairShare. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Dibuat dengan dedikasi untuk trip tanpa selisih patungan.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
