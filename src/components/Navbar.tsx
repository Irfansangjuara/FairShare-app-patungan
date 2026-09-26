"use client";

import Link from "next/link";
import { logoutAction } from "../server/actions/auth";
import { LogOut, Plus, Wallet, Sparkles } from "lucide-react";
import { useTransition } from "react";

interface NavbarProps {
  user?: {
    id: string;
    email: string;
    name: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href={user ? "/dashboard" : "/"}
          className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-[#b7e913] shadow-md group-hover:bg-slate-900 transition-colors">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold tracking-tight text-slate-950">FairShare</span>
            <span className="inline-flex items-center rounded-full bg-[#b7e913] px-2 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider">
              Patungan
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-100"
              >
                Event Saya
              </Link>
              <Link
                href="/events/new"
                className="btn-pill-lime text-xs sm:text-sm py-2 px-3.5 sm:px-4"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Event</span>
              </Link>
              <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="hidden md:inline-block text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
                  👋 {user.name}
                </span>
                <button
                  onClick={() => startTransition(() => logoutAction())}
                  disabled={isPending}
                  title="Keluar"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50"
                  aria-label="Keluar dari akun"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/api/auth/google"
                className="btn-pill-primary text-xs sm:text-sm py-2 px-4 shadow-sm flex items-center gap-2"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Masuk dengan Google</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
