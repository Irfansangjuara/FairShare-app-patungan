"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useClientSession } from "../lib/session-client";
import {
  Menu,
  X,
  Home,
  BookOpen,
  Info,
  LayoutDashboard,
  LogIn,
  UserPlus,
  ChevronRight,
} from "lucide-react";

interface FairShareNavbarProps {
  user?: {
    name: string;
    email: string;
    role?: string;
  } | null;
}

export function FairShareNavbar({ user: serverUser }: FairShareNavbarProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // When no `user` prop is supplied the page is statically rendered (marketing
  // pages must not read cookies), so the signed-in state resolves on the client
  // through the shared session probe. When the prop IS supplied (dashboard and
  // admin shells), it is trusted as-is.
  const { user } = useClientSession(serverUser);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile/tablet sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const navLinks = [
    { href: "/", label: "Home", icon: Home, exact: true },
    ...(!user
      ? [
          {
            href: "/register",
            label: "Daftar Free",
            icon: UserPlus,
            badge: "Gratis",
            highlight: true,
            exact: true,
          },
        ]
      : []),
    { href: "/blog", label: "Blog", icon: BookOpen, exact: false },
    { href: "/about", label: "Tentang", icon: Info, exact: true },
  ];

  return (
    <>
      {/* ============================================================ */}
      {/* 1. TAMPILAN MOBILE & TABLET (layar < lg / < 1024px)           */}
      {/* Header bar dengan Logo di pojok kiri & Hamburger di kanan    */}
      {/* ============================================================ */}
      <div className="lg:hidden sticky top-0 inset-x-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 py-3 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo di pojok kiri */}
          <Link
            href="/"
            className="flex items-center gap-2.5 focus:outline-hidden hover:opacity-90 transition-opacity"
            aria-label="FairShare, beranda"
          >
            <Image
              src="/assets/img/logo-fairshare.webp"
              alt="Fair Share"
              className="h-9 sm:h-10 w-auto object-contain"
              width={40}
              height={40}
              priority
            />
            <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-950 font-sans">
              FairShare
            </span>
          </Link>

          {/* Icon Hamburger di pojok kanan untuk memunculkan sidebar menu */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center justify-center p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200/90 bg-slate-50/80 focus:outline-hidden transition-all shadow-2xs"
            aria-label="Buka menu navigasi"
          >
            <Menu className="h-6 w-6 text-slate-800" />
          </button>
        </div>
      </div>

      {/* Sidebar Menu Drawer untuk Mobile & Tablet */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Off-canvas Sidebar Drawer */}
          <div className="relative flex flex-col w-72 sm:w-80 max-w-[85vw] bg-white h-full shadow-2xl z-50 animate-in slide-in-from-left duration-300">
            {/* Header Sidebar: Logo & Tombol Tutup (X) */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Link
                href="/"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-2.5"
              >
                <Image
                  src="/assets/img/logo-fairshare.webp"
                  alt="Fair Share"
                  className="h-8 w-auto object-contain"
                  width={36}
                  height={36}
                  priority
                />
                <div className="flex flex-col">
                  <span className="font-bold text-base tracking-tight text-slate-950 font-sans">
                    FairShare
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Aplikasi Patungan Cerdas
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigasi Menu Sidebar */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
              <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Menu Utama
              </div>

              {navLinks.map((link) => {
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive
                          ? "text-[#b7e913]"
                          : link.highlight
                          ? "text-lime-600"
                          : "text-slate-400"
                      }`}
                    />
                    <span className="font-sans">{link.label}</span>

                    {link.badge && (
                      <span className="ml-auto text-[10px] font-extrabold bg-[#b7e913] text-black px-2 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}

                    <ChevronRight
                      className={`ml-auto h-4 w-4 transition-transform ${
                        isActive ? "text-slate-400" : "text-slate-300"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Bagian Bawah Sidebar: User Info / Tombol Aksi */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/80 space-y-2">
              {user ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 p-2 bg-white border border-gray-200/80 rounded-xl">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-inner font-sans">
                      {user.name
                        ? user.name.charAt(0).toUpperCase()
                        : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="truncate text-xs font-bold text-slate-900 block font-sans">
                        {user.name || "Member"}
                      </span>
                      <span className="truncate text-[11px] text-slate-400 block">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsSidebarOpen(false)}
                    className="btn-pill-lime w-full justify-center py-2.5 px-4 font-bold text-sm shadow-xs flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Buka Dashboard</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/register"
                    onClick={() => setIsSidebarOpen(false)}
                    className="btn-pill-lime w-full justify-center py-2.5 px-4 font-bold text-sm shadow-xs flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Daftar Sekarang (Free)</span>
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsSidebarOpen(false)}
                    className="btn-pill-primary w-full justify-center py-2 px-4 font-semibold text-xs flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Masuk ke Akun</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. TAMPILAN DESKTOP (layar >= lg / >= 1024px)                 */}
      {/* Header menu navigasi desktop elegan rata tengah               */}
      {/* ============================================================ */}
      <header className="hidden lg:flex sticky top-5 inset-x-0 z-50 justify-center px-4 w-full pointer-events-none">
        <nav className="pointer-events-auto relative mx-auto w-fit max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md rounded-full border border-gray-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] py-2 px-5 transition-all">
          <div className="flex items-center justify-center gap-4 lg:gap-5">
            {/* Brand Logo */}
            <Link
              className="inline-flex items-center flex-none rounded-md focus:outline-hidden hover:opacity-90 transition-opacity"
              href="/"
              aria-label="FairShare, beranda"
            >
              <Image
                src="/assets/img/logo-fairshare.webp"
                alt="Fair Share"
                className="h-10 w-auto object-contain"
                width={40}
                height={40}
                priority
              />
            </Link>

            {/* Subtle Vertical Divider on Desktop */}
            <div className="h-4 w-px bg-gray-200" />

            {/* Desktop Menu Links */}
            <div className="flex items-center gap-2 text-[15px]">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-full transition-colors font-normal no-underline hover:no-underline ${
                  pathname === "/"
                    ? "text-gray-950 font-semibold"
                    : "text-gray-600 hover:text-gray-950"
                }`}
                style={{ textDecoration: "none" }}
              >
                Home
              </Link>

              {!user && (
                <Link
                  href="/register"
                  className={`px-3 py-1.5 rounded-full transition-colors font-bold no-underline hover:no-underline ${
                    pathname === "/register"
                      ? "text-black"
                      : "text-gray-900 hover:text-black"
                  }`}
                  style={{ textDecoration: "none" }}
                >
                  Daftar Free
                </Link>
              )}

              <Link
                href="/blog"
                className={`px-3 py-1.5 rounded-full transition-colors font-normal no-underline hover:no-underline ${
                  pathname.startsWith("/blog")
                    ? "text-gray-950 font-semibold"
                    : "text-gray-600 hover:text-gray-950"
                }`}
                style={{ textDecoration: "none" }}
              >
                Blog
              </Link>

              <Link
                href="/about"
                className={`px-3 py-1.5 rounded-full transition-colors font-normal no-underline hover:no-underline ${
                  pathname === "/about"
                    ? "text-gray-950 font-semibold"
                    : "text-gray-600 hover:text-gray-950"
                }`}
                style={{ textDecoration: "none" }}
              >
                Tentang
              </Link>
            </div>

            {/* Desktop Action Button */}
            <div className="flex items-center pl-1">
              {user ? (
                <Link
                  href="/dashboard"
                  className="btn btn-sm accent shrink-0 shadow-xs"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="btn btn-sm accent shrink-0 shadow-xs"
                >
                  Masuk
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
