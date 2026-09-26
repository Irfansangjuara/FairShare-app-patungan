"use client";

import { useActionState, useState } from "react";
import { registerAction } from "../server/actions/auth";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 animate-in fade-in duration-200">
          {state.error}
        </div>
      )}

      {/* Nama Lengkap */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="register-name"
          className="block text-xs font-bold text-slate-700"
        >
          Nama Lengkap
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <User className="h-4 w-4" />
          </div>
          <input
            id="register-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Contoh: Budi Santoso"
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b7e913] transition-all"
          />
        </div>
      </div>

      {/* Alamat Email */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="register-email"
          className="block text-xs font-bold text-slate-700"
        >
          Alamat Email
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="register-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@email.com"
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b7e913] transition-all"
          />
        </div>
      </div>

      {/* Kata Sandi */}
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="register-password"
          className="block text-xs font-bold text-slate-700"
        >
          Kata Sandi
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="register-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Minimal 6 karakter"
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
            <span>Membuat Akun...</span>
          </>
        ) : (
          <span>Daftar dengan Email & Kata Sandi</span>
        )}
      </button>
    </form>
  );
}
