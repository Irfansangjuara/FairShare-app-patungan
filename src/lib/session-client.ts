"use client";

import { useEffect, useState } from "react";

export interface ClientSessionUser {
  id?: string;
  name: string;
  email: string;
  role?: string;
}

/**
 * Single shared session probe for client islands.
 *
 * Public pages are statically rendered, so they cannot read the session on the
 * server. Every island that needs the signed-in state (navbar, CTAs) shares one
 * memoized request instead of issuing its own.
 */
let sessionPromise: Promise<ClientSessionUser | null> | null = null;

function loadSession(): Promise<ClientSessionUser | null> {
  sessionPromise ??= fetch("/api/auth/session", { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : null))
    .then((data: { user?: ClientSessionUser | null } | null) => data?.user ?? null)
    .catch(() => null);
  return sessionPromise;
}

export function useClientSession(serverUser?: ClientSessionUser | null): {
  user: ClientSessionUser | null;
  isLoading: boolean;
} {
  const [fetched, setFetched] = useState<ClientSessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(serverUser === undefined);

  useEffect(() => {
    if (serverUser !== undefined) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    loadSession().then((user) => {
      if (cancelled) return;
      setFetched(user);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [serverUser]);

  if (serverUser !== undefined) {
    return { user: serverUser, isLoading: false };
  }

  return { user: fetched, isLoading };
}
