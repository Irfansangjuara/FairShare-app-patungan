"use client";

import { useActionState, useState } from "react";
import { loginAction } from "../server/actions/auth";
import { Loader2, Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fillAdminCredentials = () => {
    setEmail("admin@admin.com");
    setPassword("admin#123");
  };

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 animate-in fade-in duration-200">
          {state.error}
        </div>
      )}

      {/* Alamat Email */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="login-email"
          className="block text-xs font-bold text-slate-700"
        >
          Alamat Email
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b7e913] transition-all"
          />
        </div>
      </div>

      {/* Kata Sandi */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="login-password"
          className="block text-xs font-bold text-slate-700"
        >
          Kata Sandi
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Masukkan kata sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b7e913] transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full btn-pill-primary py-3 sm:py-3.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span>Memverifikasi Akun...</span>
          </>
        ) : (
          <span>Masuk dengan Email</span>
        )}
      </button>

      {/* Box Akses Akun Admin */}
      <div className="rounded-2xl bg-amber-50/80 p-3.5 border border-amber-200 text-xs text-amber-900 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <Shield className="h-3.5 w-3.5 text-amber-700" />
            <span>Akses Cepat Akun Admin</span>
          </div>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="text-[11px] font-bold text-black bg-[#b7e913] hover:bg-lime-400 px-3 py-1 rounded-full shadow-sm transition-all active:scale-95"
          >
            Isi Otomatis
          </button>
        </div>
        <div className="text-[11px] text-amber-900/90 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono">
          <span>Email: <strong>admin@admin.com</strong></span>
          <span>Password: <strong>admin#123</strong></span>
        </div>
      </div>
    </form>
  );
}
