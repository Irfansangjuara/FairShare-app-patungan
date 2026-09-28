"use client";

import Link from "next/link";
import { useClientSession } from "../lib/session-client";

interface SessionAwareCtaProps {
  className: string;
  guestLabel?: string;
  signedInLabel?: string;
}

/**
 * Session-aware call to action for statically rendered pages.
 *
 * The href/label resolve on the client from the shared session probe, which is
 * what allows the landing page to stay fully static (metadata in `<head>`, CDN
 * cached) while still pointing signed-in visitors at their dashboard.
 */
export function SessionAwareCta({
  className,
  guestLabel = "Mulai Patungan Gratis",
  signedInLabel,
}: SessionAwareCtaProps) {
  const { user } = useClientSession();
  const isSignedIn = Boolean(user);

  return (
    <Link href={isSignedIn ? "/dashboard" : "/register"} className={className}>
      {isSignedIn ? signedInLabel ?? guestLabel : guestLabel}
      <span className="has-arrow inline-flex ml-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="3"
          stroke="currentColor"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>
      </span>
    </Link>
  );
}
