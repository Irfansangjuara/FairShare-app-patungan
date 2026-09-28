"use client";

import { useClientSession } from "../lib/session-client";

/**
 * Renders its children only for administrators.
 *
 * Public pages are statically rendered, so role-dependent blocks cannot be
 * decided on the server. This island reuses the shared session probe (no extra
 * request) to reveal admin-only affordances such as "Edit di Admin".
 */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useClientSession();
  if (user?.role !== "admin") {
    return null;
  }
  return <>{children}</>;
}
