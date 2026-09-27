"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction } from "../server/actions/auth";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const errorMessage = state?.error || initialError;

  return (
    <form action={formAction} className="space-y-6" id="form-login">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-600 animate-in fade-in duration-200">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-y-4">
        <div>
          <label htmlFor="email" className="block mb-2 font-medium text-gray-800 text-sm">
            Email atau WhatsApp
          </label>
          <div className="relative">
            <input
              type="text"
              id="email"
              name="email"
              className="form-control"
              placeholder="Masukkan email atau nomor WhatsApp"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2 justify-between items-center mb-2">
            <label htmlFor="password" className="block font-medium text-gray-800 text-sm">
              Kata Sandi
            </label>
            <a className="inline-flex gap-x-1 items-center text-sm link" href="#">
              Lupa kata sandi?
            </a>
          </div>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="form-control pe-11"
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex absolute inset-y-0 z-20 items-center px-3 text-gray-400 hover:text-gray-600 cursor-pointer end-0 rounded-e-md focus:outline-hidden"
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {showPassword ? (
                <svg
                  className="shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg
                  className="shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="mt-0.5 text-blue-600 rounded-sm border-gray-300 shrink-0 focus:ring-blue-500"
            />
          </div>
          <div className="ms-3">
            <label htmlFor="remember" className="text-sm text-gray-700">
              Ingat saya
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-4 btn primary w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              Memproses...
            </span>
          ) : (
            "Masuk"
          )}
        </button>

        <p className="mt-2 text-sm text-center text-gray-600">
          Belum punya akun?{" "}
          <Link className="link font-semibold" href="/register">
            Daftar gratis
          </Link>
        </p>
      </div>
    </form>
  );
}
