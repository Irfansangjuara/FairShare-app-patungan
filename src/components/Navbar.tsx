"use client";

import Link from "next/link";
import { logoutAction } from "../server/actions/auth";
import { LogOut, Plus, Wallet, ShieldCheck, BookOpen, Bot } from "lucide-react";
import { useTransition } from "react";

interface NavbarProps {
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3.5 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href={user ? "/dashboard" : "/"}
            className="group flex items-center gap-2 sm:gap-2.5 transition-transform hover:scale-[1.01]"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-black text-[#b7e913] shadow-md group-hover:bg-slate-900 transition-colors">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-950">FairShare</span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-[#b7e913] px-2 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider">
                Patungan
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
            {user && (
              <Link
                href="/dashboard"
                className="hover:text-slate-950 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                Event Saya
              </Link>
            )}
            <Link
              href="/blog"
              className="hover:text-slate-950 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              Blog
            </Link>
            {user && (
              <Link
                href="/settings"
                className="hover:text-slate-950 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
              >
                <Bot className="h-3.5 w-3.5 text-slate-500" />
                <span>AI & Telegram</span>
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="text-lime-700 bg-lime-100 hover:bg-lime-200 px-3 py-1.5 rounded-full transition-colors inline-flex items-center gap-1 font-bold"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Navigation / Action Items */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {user ? (
            <>
              <Link
                href="/events/new"
                className="btn-pill-lime text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Buat Event</span>
                <span className="sm:hidden font-bold">Event</span>
              </Link>
              <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="hidden md:inline-block text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
                  👋 {user.name}
                </span>
                <button
                  onClick={() => startTransition(() => logoutAction())}
                  disabled={isPending}
                  title="Keluar"
                  className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50"
                  aria-label="Keluar dari akun"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Link
                href="/blog"
                className="hidden sm:inline-flex text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950 px-2.5 py-1.5 rounded-full hover:bg-slate-100"
              >
                Blog
              </Link>
              <Link
                href="/login"
                className="whitespace-nowrap shrink-0 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 px-2.5 sm:px-3.5 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="btn-pill-lime whitespace-nowrap shrink-0 text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 font-bold shadow-sm"
              >
                <span>Daftar</span>
                <span className="hidden sm:inline">&nbsp;Gratis</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
