"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { adminLogoutAction } from "@/server/actions/auth";
import {
  ShieldCheck,
  Users,
  FileText,
  Bot,
  Globe,
  Settings,
  LayoutDashboard,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  ShieldAlert,
} from "lucide-react";

interface AdminSidebarProps {
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({
  user,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await adminLogoutAction();
    });
  };

  const navItems = [
    {
      label: "Overview",
      href: "/admin",
      icon: ShieldCheck,
      active: pathname === "/admin",
      badge: null,
    },
    {
      label: "Pengguna",
      href: "/admin/users",
      icon: Users,
      active: pathname.startsWith("/admin/users"),
      badge: null,
    },
    {
      label: "Artikel Blog",
      href: "/admin/blog",
      icon: FileText,
      active: pathname.startsWith("/admin/blog") || pathname.startsWith("/admin/articles"),
      badge: null,
    },
    {
      label: "AI Agent & API",
      href: "/admin/agent",
      icon: Bot,
      active: pathname.startsWith("/admin/agent"),
      badge: "AI",
    },
    {
      label: "Halaman CMS",
      href: "/admin/pages",
      icon: Globe,
      active: pathname.startsWith("/admin/pages"),
      badge: null,
    },
    {
      label: "SEO Global",
      href: "/admin/seo",
      icon: Settings,
      active: pathname.startsWith("/admin/seo"),
      badge: null,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto overflow-x-hidden no-scrollbar bg-slate-950 text-white">
      {/* Top Section: Logo & Toggle */}
      <div>
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          } px-4 py-5 border-b border-slate-800/90`}
        >
          <Link
            href="/admin"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 group overflow-hidden"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center">
              <Image
                src="/assets/img/logo-fairshare.webp"
                alt="FairShare"
                width={40}
                height={40}
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
                priority
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap overflow-hidden transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-white font-sans">
                    FairShare
                  </span>
                  <span className="rounded-full bg-[#b7e913] px-2 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider">
                    Admin
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Pusat Kendali
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
            aria-label="Tutup menu admin"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menus */}
        <div className="px-3 py-4 space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Menu Administrasi
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  item.active
                    ? "bg-slate-800 text-[#b7e913] shadow-sm"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    item.active ? "text-[#b7e913]" : "text-slate-400 group-hover:text-white"
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1 font-sans">{item.label}</span>
                )}

                {!isCollapsed && item.badge && (
                  <span
                    className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.active
                        ? "bg-[#b7e913] text-black"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-white shadow-xl whitespace-nowrap group-hover:block border border-slate-700">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Secondary Links: To Dashboard & Web */}
        <div className="px-3 pt-3 border-t border-slate-800/80 space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigasi Cepat
            </div>
          )}
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            title={isCollapsed ? "Dashboard Member" : undefined}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-white transition-colors ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-[#b7e913]" />
            {!isCollapsed && (
              <span className="truncate flex-1 font-sans">Dashboard Member</span>
            )}

            {isCollapsed && (
              <div className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-white shadow-xl whitespace-nowrap group-hover:block border border-slate-700">
                Dashboard Member
              </div>
            )}
          </Link>

          <Link
            href="/"
            target="_blank"
            onClick={onCloseMobile}
            title={isCollapsed ? "Lihat Web (Landing Page)" : undefined}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-white transition-colors ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
          >
            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-white" />
            {!isCollapsed && (
              <span className="truncate flex-1 font-sans">Lihat Web</span>
            )}

            {isCollapsed && (
              <div className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-white shadow-xl whitespace-nowrap group-hover:block border border-slate-700">
                Lihat Web
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Bottom Section: Admin User Info, Collapse Toggle & Logout */}
      <div className="border-t border-slate-800/90 p-3 space-y-2 bg-slate-900/60">
        {/* Admin Card */}
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-2xs ${
            isCollapsed ? "justify-center p-2" : ""
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#b7e913] text-sm font-extrabold text-black shadow-inner font-sans">
            {user.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="truncate text-xs font-bold text-white block font-sans">
                  {user.name || "Administrator"}
                </span>
                <span className="text-[9px] bg-red-950 text-red-400 border border-red-800/60 px-1 rounded font-bold">
                  Admin
                </span>
              </div>
              <span className="truncate text-[11px] text-slate-400 block">
                {user.email}
              </span>
            </div>
          )}
        </div>

        {/* Maximize / Minimize Collapse Toggle (Desktop only) */}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? "Perbesar Menu (Maximize)" : "Perkecil Menu (Minimize)"}
          className={`hidden md:flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent hover:border-slate-700 transition-all ${
            isCollapsed ? "justify-center px-2" : ""
          }`}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-[#b7e913]" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 text-slate-400" />
              <span className="font-sans">Perkecil Menu</span>
            </>
          )}
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          title={isCollapsed ? "Keluar Admin" : undefined}
          className={`group flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors ${
            isCollapsed ? "justify-center px-2" : ""
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          {!isCollapsed && (
            <span className="font-sans">{isPending ? "Keluar..." : "Keluar Admin"}</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Collapsible: w-20 vs w-64) */}
      <aside
        className={`hidden md:flex flex-col bg-slate-950 border-r border-slate-800 h-screen sticky top-0 transition-all duration-300 ease-in-out z-30 shrink-0 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Off-Canvas) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-slate-950 h-full shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
