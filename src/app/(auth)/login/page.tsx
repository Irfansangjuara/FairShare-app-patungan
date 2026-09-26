import Link from "next/link";
import { GoogleLoginButton } from "../../../components/GoogleLoginButton";
import { Wallet, ShieldCheck, CheckCircle2 } from "lucide-react";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-[#b7e913] shadow-md group-hover:scale-105 transition-transform">
              <Wallet className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-950">FairShare</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Masuk dengan Akun Google
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Akses instan tanpa perlu mengingat kata sandi tambahan
          </p>
        </div>

        {/* Card Form */}
        <div className="card-diskon p-6 sm:p-8 bg-white border border-slate-200 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {decodeURIComponent(error)}
            </div>
          )}

          <div className="space-y-4">
            <GoogleLoginButton label="Masuk dengan Google" />

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Aman & Praktis</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                FairShare hanya membaca nama, alamat email, dan foto profil publik akun Google Anda untuk identifikasi event dan peserta.
              </p>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100">
            Kembali ke{" "}
            <Link href="/" className="font-semibold text-slate-700 hover:text-slate-950 underline">
              Halaman Utama
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
