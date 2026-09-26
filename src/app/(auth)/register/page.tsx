import Link from "next/link";
import { GoogleLoginButton } from "../../../components/GoogleLoginButton";
import { RegisterForm } from "../../../components/RegisterForm";
import { Wallet, CheckCircle2, BadgeCheck } from "lucide-react";

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-3.5 sm:px-6 py-8 sm:py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-md space-y-5 sm:space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-1 group">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-black text-[#b7e913] shadow-md group-hover:scale-105 transition-transform">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-950">FairShare</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Daftar Akun Baru
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            Mulai kelola patungan trip secara adil, rapi, dan bebas pusing
          </p>
        </div>

        {/* Card Form */}
        <div className="card-diskon p-5 sm:p-8 bg-white border border-slate-200 space-y-5">
          {/* Segmented Switcher Masuk / Daftar */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs sm:text-sm font-semibold">
            <Link
              href="/login"
              className="py-2 text-center rounded-xl text-slate-600 hover:text-slate-950 transition-colors"
            >
              Masuk
            </Link>
            <div className="py-2 text-center rounded-xl bg-white text-slate-900 shadow-sm font-bold">
              Daftar Baru
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {decodeURIComponent(error)}
            </div>
          )}

          <div className="space-y-4 pt-1">
            {/* Google OAuth (Opsi Instan & Praktis) */}
            <GoogleLoginButton size="large" label="Daftar dengan Akun Google" />

            {/* Pemisah Alternatif Email */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 font-semibold text-slate-400">
                  atau daftar dengan email
                </span>
              </div>
            </div>

            {/* Alternatif Form Registrasi Email & Password */}
            <RegisterForm />

            {/* Value props list */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <BadgeCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Keuntungan Akun FairShare:</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-600 pl-1">

                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>100% Gratis selamanya tanpa biaya tersembunyi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Langsung aktif seketika tanpa verifikasi email manual</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Data event tersimpan di cloud & siap disinkronkan</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-slate-900 hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline">
            ← Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
