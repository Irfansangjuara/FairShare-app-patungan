"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronRight, ExternalLink, LayoutDashboard, ShieldCheck } from "lucide-react";

interface AdminHeaderProps {
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

export function AdminHeader({
  user,
  onOpenMobile,
  isCollapsed,
  onToggleCollapse,
}: AdminHeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/admin") return "Overview Administrasi";
    if (pathname.startsWith("/admin/users")) return "Manajemen Pengguna";
    if (pathname.startsWith("/admin/blog") || pathname.startsWith("/admin/articles"))
      return "Artikel Blog";
    if (pathname.startsWith("/admin/agent")) return "AI Agent & API";
    if (pathname.startsWith("/admin/pages")) return "Halaman CMS";
    if (pathname.startsWith("/admin/seo")) return "SEO Global";
    return "Admin Panel";
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle & Page Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobile}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-hidden"
            aria-label="Buka menu navigasi admin"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb info */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
            <span className="hidden sm:inline font-semibold text-slate-400">FairShare</span>
            <ChevronRight className="hidden sm:inline h-3.5 w-3.5 text-slate-300" />
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 text-sm sm:text-base">
              <ShieldCheck className="h-4 w-4 text-[#84a908] hidden sm:inline" />
              {getPageTitle()}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dashboard Member</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lihat Web</span>
          </Link>

          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

          {/* Admin Avatar & Status */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden md:inline font-sans truncate max-w-[120px]">
                {user.name}
              </span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-[#b7e913] shadow-inner font-sans">
              {user.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
