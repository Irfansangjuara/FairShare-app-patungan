"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface FairShareNavbarProps {
  user?: {
    name: string;
    email: string;
    role?: string;
  } | null;
}

export function FairShareNavbar({ user }: FairShareNavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-3 sm:top-5 inset-x-0 z-50 flex justify-center px-4 w-full pointer-events-none">
      <nav
        className={`pointer-events-auto relative mx-auto w-fit max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md ${
          isOpen ? "rounded-2xl" : "rounded-full"
        } border border-gray-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] py-1.5 md:py-2 px-3.5 md:px-5 transition-all`}
      >
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 md:gap-4 lg:gap-5">
          {/* Brand Logo */}
          <Link
            className="inline-flex items-center flex-none rounded-md focus:outline-hidden hover:opacity-90 transition-opacity"
            href="/"
            aria-label="Fair Share, beranda"
          >
            <Image
              src="/assets/img/logo-fairshare.webp"
              alt="Fair Share"
              className="h-9 md:h-10 w-auto object-contain"
              width={40}
              height={40}
              priority
            />
          </Link>

          {/* Subtle Vertical Divider on Desktop */}
          <div className="hidden md:block h-4 w-px bg-gray-200" />

          {/* Desktop Menu Links - Rata Tengah & Profesional */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 text-[15px]">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-full transition-colors font-normal no-underline hover:no-underline ${
                pathname === "/"
                  ? "text-gray-950 font-normal"
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
                  ? "text-gray-950 font-normal"
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
                  ? "text-gray-950 font-normal"
                  : "text-gray-600 hover:text-gray-950"
              }`}
              style={{ textDecoration: "none" }}
            >
              Tentang
            </Link>
          </div>

          {/* Desktop Action Button */}
          <div className="hidden md:flex items-center pl-1">
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

          {/* Mobile Toggle Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex justify-center items-center text-gray-500 rounded-full border border-gray-200 size-8 hover:bg-gray-100 focus:outline-hidden transition-colors"
              aria-expanded={isOpen}
              aria-label="Toggle navigation"
            >
              {isOpen ? (
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
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              ) : (
                <svg
                  className="shrink-0 size-3.5"
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
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <line x1="3" x2="21" y1="12" y2="12" />
                  <line x1="3" x2="21" y1="18" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Collapsible Menu */}
        {isOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100 flex flex-col items-center gap-1 pb-1 text-center animate-in fade-in duration-200">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={`w-full py-1.5 font-normal no-underline hover:no-underline ${
                pathname === "/" ? "text-gray-950 font-normal" : "text-gray-600"
              }`}
              style={{ textDecoration: "none" }}
            >
              Home
            </Link>

            {!user && (
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="w-full py-1.5 font-bold text-gray-900 hover:text-black no-underline hover:no-underline"
                style={{ textDecoration: "none" }}
              >
                Daftar Free
              </Link>
            )}

            <Link
              href="/blog"
              onClick={() => setIsOpen(false)}
              className="w-full py-1.5 font-normal text-gray-600 hover:text-gray-950 no-underline hover:no-underline"
              style={{ textDecoration: "none" }}
            >
              Blog
            </Link>

            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="w-full py-1.5 font-normal text-gray-600 hover:text-gray-950 no-underline hover:no-underline"
              style={{ textDecoration: "none" }}
            >
              Tentang
            </Link>

            <div className="w-full pt-2">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-sm accent w-full justify-center"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-sm accent w-full justify-center"
                >
                  Masuk
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
