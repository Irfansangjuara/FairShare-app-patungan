"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Plus, Bot, Key, ChevronRight } from "lucide-react";

interface DashboardHeaderProps {
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
  onOpenMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DashboardHeader({
  user,
  onOpenMobile,
  isCollapsed,
  onToggleCollapse,
}: DashboardHeaderProps) {
  const pathname = usePathname();

  // Determine current section title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard Event";
    if (pathname === "/events/new" || pathname === "/dashboard/events/new") return "Buat Event Baru";
    if (pathname.startsWith("/events/") || pathname.startsWith("/dashboard/events/")) return "Detail Event Patungan";
    if (pathname === "/settings" || pathname === "/dashboard/settings") return "Pengaturan AI & Bot";
    if (
      pathname === "/token" ||
      pathname === "/dashboard/token" ||
      pathname === "/developer" ||
      pathname === "/dashboard/developer"
    )
      return "Token Akses Telegram";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo & Mobile Toggle & Page Breadcrumb */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Logo on mobile & tablet (pojok kiri) */}
          <Link
            href="/dashboard"
            className="lg:hidden flex items-center gap-1.5 mr-0.5 hover:opacity-90 transition-opacity"
            aria-label="FairShare Dashboard"
          >
            <Image
              src="/assets/img/logo-fairshare.webp"
              alt="FairShare"
              width={34}
              height={34}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* Hamburger Icon to toggle sidebar menu */}
          <button
            type="button"
            onClick={onOpenMobile}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden transition-colors"
            aria-label="Buka menu navigasi"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb info */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
            <span className="hidden sm:inline font-semibold text-slate-400">FairShare</span>
            <ChevronRight className="hidden sm:inline h-3.5 w-3.5 text-slate-300" />
            <span className="font-bold text-slate-900 text-sm sm:text-base">
              {getPageTitle()}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Create Event CTA button */}
          <Link
            href="/dashboard/events/new"
            className="btn-pill-lime text-xs sm:text-sm py-2 px-3.5 sm:px-4 font-bold shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Buat Event</span>
          </Link>

          {/* Quick AI & Developer Links on Desktop */}
          <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <Link
              href="/dashboard/settings"
              title="Pengaturan AI & Telegram"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Bot className="h-4 w-4" />
            </Link>
            <Link
              href="/token"
              title="Token Akses Telegram"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Key className="h-4 w-4" />
            </Link>
          </div>

          {/* User Avatar */}
          <div className="flex items-center pl-1 sm:pl-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-inner font-sans">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
