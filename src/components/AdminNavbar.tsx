"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, FileText, Globe, Settings, ArrowLeft, ExternalLink } from "lucide-react";

interface AdminNavbarProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export function AdminNavbar({ user }: AdminNavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: ShieldCheck, exact: true },
    { href: "/admin/articles", label: "Artikel Blog", icon: FileText, exact: false },
    { href: "/admin/pages", label: "Halaman CMS", icon: Globe, exact: false },
    { href: "/admin/seo", label: "SEO Global", icon: Settings, exact: false },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#b7e913] text-black font-extrabold text-sm shadow-sm">
              FS
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white">FairShare</span>
              <span className="rounded-md bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-lime-400 uppercase tracking-wider">
                Admin
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4 pl-4 border-l border-slate-800">
            {navLinks.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    isActive
                      ? "bg-slate-800 text-[#b7e913]"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User & Back to site */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-full hover:bg-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ke Dashboard App</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-full hover:bg-slate-900"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lihat Web</span>
          </Link>

          <div className="h-4 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate max-w-[120px]">{user.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
