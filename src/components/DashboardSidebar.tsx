"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { logoutAction } from "../server/actions/auth";
import {
  LayoutDashboard,
  PlusCircle,
  Bot,
  Key,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react";

interface DashboardSidebarProps {
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

export function DashboardSidebar({
  user,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const navItems = [
    {
      label: "Dashboard Event",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
      badge: null,
    },
    {
      label: "Buat Event Baru",
      href: "/dashboard/events/new",
      icon: PlusCircle,
      active: pathname === "/events/new" || pathname === "/dashboard/events/new",
      badge: "Baru",
    },
    {
      label: "Pengaturan AI & Bot",
      href: "/dashboard/settings",
      icon: Bot,
      active: pathname === "/dashboard/settings",
      badge: null,
    },
    {
      label: "Token Akses Telegram",
      href: "/dashboard/token",
      icon: Key,
      active: pathname === "/dashboard/token",
      badge: "Token",
    },
  ];

  // Sidebar content (shared between desktop and mobile)
  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto overflow-x-hidden no-scrollbar">
      {/* Top Section: Logo & Toggle */}
      <div>
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-4 py-5 border-b border-slate-200/80`}>
          <Link
            href="/dashboard"
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
                  <span className="text-lg font-bold tracking-tight text-slate-950 font-sans">FairShare</span>
                  <span className="rounded-full bg-[#b7e913] px-2 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider">
                    Patungan
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Dashboard Member</span>
              </div>
            )}
          </Link>

          {/* Mobile & Tablet close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menus */}
        <div className="px-3 py-4 space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Menu Utama
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
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    item.active ? "text-[#b7e913]" : "text-slate-500 group-hover:text-slate-900"
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
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-lg whitespace-nowrap group-hover:block">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Secondary Links */}
        <div className="px-3 pt-3 border-t border-slate-200/70 space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigasi Cepat
            </div>
          )}
          <Link
            href="/"
            onClick={onCloseMobile}
            title={isCollapsed ? "Halaman Depan (Landing Page)" : undefined}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition-colors ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
          >
            <Home className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-900" />
            {!isCollapsed && <span className="truncate flex-1 font-sans">Landing Page</span>}
            {!isCollapsed && <ExternalLink className="h-3 w-3 text-slate-300" />}

            {isCollapsed && (
              <div className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-lg whitespace-nowrap group-hover:block">
                Landing Page
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Bottom Section: User Info, Collapse Toggle & Logout */}
      <div className="border-t border-slate-200/80 p-3 space-y-2 bg-slate-50/60">
        {/* User Card */}
        <div className={`flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs ${isCollapsed ? "justify-center p-2" : ""}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shadow-inner font-sans">
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="truncate text-xs font-bold text-slate-900 block font-sans">
                  {user.name || "Member"}
                </span>
                {user.role === "admin" && (
                  <span className="text-[9px] bg-red-100 text-red-700 px-1 rounded font-bold">
                    Admin
                  </span>
                )}
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
          className={`hidden lg:flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-950 border border-transparent hover:border-slate-200 transition-all ${
            isCollapsed ? "justify-center px-2" : ""
          }`}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-slate-500" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 text-slate-500" />
              <span className="font-sans">Perkecil Menu</span>
            </>
          )}
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          title={isCollapsed ? "Keluar Akun" : undefined}
          className={`group flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors ${
            isCollapsed ? "justify-center px-2" : ""
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          {!isCollapsed && <span className="font-sans">{isPending ? "Keluar..." : "Keluar Akun"}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Collapsible) */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200/90 h-screen sticky top-0 transition-all duration-300 ease-in-out z-30 shrink-0 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile & Tablet Drawer (Off-Canvas) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-white h-full shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
