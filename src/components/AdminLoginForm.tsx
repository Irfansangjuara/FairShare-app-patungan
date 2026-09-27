"use client";

import { useActionState, useState } from "react";
import { adminLoginAction } from "@/server/actions/auth";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(adminLoginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const fillDefaultAdmin = () => {
    setEmailValue("admin@fairshare.copilotmarketing.id");
    setPasswordValue("#@Cusn77");
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-[#b7e913] shadow-inner mb-2">
          <span className="flex h-2 w-2 rounded-full bg-[#b7e913] animate-pulse" />
          <span>FairShare Admin Control Room</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Portal Masuk Administrator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Akses terbatas khusus pengelola sistem, artikel, dan manajemen pengguna FairShare.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="card-diskon bg-slate-900/90 border border-slate-800 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
        {state?.error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium leading-relaxed">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Alamat Email Admin</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                name="email"
                required
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                placeholder="admin@fairshare.copilotmarketing.id"
                className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 px-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#b7e913] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Kata Sandi Admin</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 px-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#b7e913] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full btn-pill-lime py-3 px-6 text-sm font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memverifikasi Akses...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard Admin</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Helper */}
        <div className="pt-4 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={fillDefaultAdmin}
            className="text-[11px] text-slate-400 hover:text-[#b7e913] transition-colors inline-flex items-center gap-1.5"
          >
            <span>Gunakan Akun Utama (admin@fairshare.copilotmarketing.id)</span>
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="text-center space-y-2">
        <Link
          href="/"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-block"
        >
          ← Kembali ke Website Publik FairShare
        </Link>
        <div>
          <Link
            href="/login"
            className="text-xs text-slate-500 hover:text-[#b7e913] transition-colors inline-block"
          >
            Bukan Administrator? Masuk sebagai Pengguna Biasa
          </Link>
        </div>
      </div>
    </div>
  );
}
