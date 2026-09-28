import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "fairshare_session";

/**
 * Edge-level gate. This only checks for the *presence* of the session cookie —
 * it deliberately does not validate it, because the session store (Postgres)
 * is not reachable from the middleware runtime.
 *
 * The real, authoritative authorisation check happens in the page/route itself
 * (`requireUser()` / `requireAdmin()` / `getSessionUser()`). This layer exists
 * so an unauthenticated visitor never even reaches the protected route tree,
 * which removes any chance of a future page forgetting its own guard.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (hasSessionCookie) {
    return NextResponse.next();
  }

  // `/admin` and `/admin/login` are the admin sign-in entry points; the admin
  // layout renders the login form for anonymous visitors.
  if (pathname.startsWith("/admin") && pathname !== "/admin" && pathname !== "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const isDashboardArea =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/events" ||
    pathname.startsWith("/events/");

  if (isDashboardArea) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?redirect=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/events",
    "/events/:path*",
  ],
};
