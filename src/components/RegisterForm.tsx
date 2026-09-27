"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registerAction } from "../server/actions/auth";

export function RegisterForm({ initialError }: { initialError?: string }) {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const errorMessage = state?.error || initialError;

  return (
    <form action={formAction} className="grid gap-y-4" id="register-form">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-600 animate-in fade-in duration-200">
          {errorMessage}
        </div>
      )}

      {/* Nama Lengkap */}
      <div>
        <label htmlFor="name" className="block mb-2 font-medium text-gray-800 text-sm">
          Nama Lengkap
        </label>
        <div className="relative">
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            placeholder="Masukkan nama lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
      </div>

      {/* Alamat Email */}
      <div>
        <label htmlFor="email" className="block mb-2 font-medium text-gray-800 text-sm">
          Alamat Email
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            placeholder="Masukkan alamat email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Nomor WhatsApp */}
      <div>
        <label htmlFor="phone" className="block mb-2 font-medium text-gray-800 text-sm">
          Nomor WhatsApp{" "}
          <span className="text-gray-400 font-normal text-xs">(Opsional)</span>
        </label>
        <div className="relative">
          <input
            type="tel"
            id="phone"
            inputMode="numeric"
            name="phone"
            className="form-control"
            placeholder="Contoh: 081234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      {/* Kata Sandi */}
      <div>
        <label htmlFor="password" className="block mb-2 font-medium text-gray-800 text-sm">
          Kata Sandi
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            className="form-control pe-11"
            placeholder="Masukkan kata sandi (min. 6 karakter)"
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

      {/* Konfirmasi Kata Sandi */}
      <div>
        <label
          htmlFor="password_confirmation"
          className="block mb-2 font-medium text-gray-800 text-sm"
        >
          Konfirmasi Kata Sandi
        </label>
        <div className="relative">
          <input
            id="password_confirmation"
            type={showConfirmPassword ? "text" : "password"}
            name="password_confirmation"
            className="form-control pe-11"
            placeholder="Masukkan ulang kata sandi"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="flex absolute inset-y-0 z-20 items-center px-3 text-gray-400 hover:text-gray-600 cursor-pointer end-0 rounded-e-md focus:outline-hidden"
            aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {showConfirmPassword ? (
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

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 btn primary w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            Mendaftarkan Akun...
          </span>
        ) : (
          "Daftar Gratis Sekarang"
        )}
      </button>

      <p className="mt-2 text-sm text-center text-gray-600">
        Sudah punya akun?{" "}
        <Link className="link font-semibold" href="/login">
          Masuk
        </Link>
      </p>

      <p className="text-xs text-center text-gray-500 leading-relaxed">
        Dengan mendaftar, saya menyetujui{" "}
        <Link className="link font-normal text-xs" href="/terms">
          syarat, ketentuan, dan kebijakan privasi Fair Share
        </Link>
        .
      </p>
    </form>
  );
}
