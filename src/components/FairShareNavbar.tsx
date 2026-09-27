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
    <header className="flex sticky inset-x-0 top-0 z-50 flex-wrap px-4 mx-auto w-full md:w-[500px] md:justify-start md:flex-nowrap md:mt-6">
      <nav className="relative mx-auto mt-2 md:mt-4 w-full bg-white/95 backdrop-blur-sm rounded-3xl border border-gray-200 md:max-w-md md:flex md:items-center md:justify-between py-2 md:pl-8 md:px-2 shadow-sm">
        <div className="flex justify-between items-center px-4 md:px-0">
          <div className="flex items-center">
            <Link
              className="inline-block flex-none text-2xl font-semibold rounded-md focus:outline-hidden focus:opacity-80"
              href="/"
              aria-label="Fair Share, beranda"
            >
              <Image
                src="/assets/img/fair-share-logo.png"
                alt="Fair Share"
                className="h-10 w-auto"
                width={105}
                height={40}
                priority
              />
            </Link>
            <div className="ms-1 sm:ms-2"></div>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex justify-center items-center text-gray-500 rounded-full border border-gray-200 size-8 hover:bg-gray-100 focus:outline-hidden"
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

        <div
          className={`${
            isOpen ? "block" : "hidden"
          } overflow-hidden transition-all duration-300 basis-full grow md:block`}
        >
          <div className="flex flex-col gap-2 px-2 py-2 mt-3 max-md:text-center md:flex-row md:items-center md:gap-3 md:mt-0 md:py-0 md:ps-4">
            {!user ? (
              <>
                <Link
                  className={`py-0.5 md:py-3 md:px-1 hover:text-gray-900 transition-colors focus:outline-hidden md:ml-auto ${
                    pathname === "/register" ? "text-gray-950 font-semibold" : "text-gray-600"
                  }`}
                  href="/register"
                  onClick={() => setIsOpen(false)}
                >
                  Daftar
                </Link>
                <Link
                  className={`py-0.5 md:py-3 md:px-1 hover:text-gray-900 transition-colors focus:outline-hidden md:mr-auto md:ml-auto ${
                    pathname === "/about" ? "text-gray-950 font-semibold" : "text-gray-600"
                  }`}
                  href="/about"
                  onClick={() => setIsOpen(false)}
                >
                  Tentang
                </Link>
                <Link
                  className="btn btn-sm accent"
                  href="/login"
                  onClick={() => setIsOpen(false)}
                >
                  Masuk
                </Link>
              </>
            ) : (
              <>
                <Link
                  className={`py-0.5 md:py-3 md:px-1 hover:text-gray-900 transition-colors focus:outline-hidden md:ml-auto ${
                    pathname === "/about" ? "text-gray-950 font-semibold" : "text-gray-600"
                  }`}
                  href="/about"
                  onClick={() => setIsOpen(false)}
                >
                  Tentang
                </Link>
                <Link
                  className={`py-0.5 md:py-3 md:px-1 hover:text-gray-900 transition-colors focus:outline-hidden ${
                    pathname.startsWith("/blog") ? "text-gray-950 font-semibold" : "text-gray-600"
                  }`}
                  href="/blog"
                  onClick={() => setIsOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  className="btn btn-sm accent"
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
