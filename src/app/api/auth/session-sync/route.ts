import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifySessionSyncToken } from "@/lib/oauth-state";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const redirectPath = request.nextUrl.searchParams.get("redirect") || "/dashboard";

  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ||
    headerList.get("host") ||
    request.headers.get("host") ||
    "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const cleanHost = host.toLowerCase().split(":")[0];

  const verification = verifySessionSyncToken(token);

  if (!verification.valid || !verification.sessionId) {
    console.error("Session sync token verification failed");
    return NextResponse.redirect(new URL("/login?error=Sesi%20kedaluwarsa.%20Silakan%20masuk%20kembali.", request.url));
  }

  // Safe redirect path validation
  const safePath =
    redirectPath.startsWith("/") && !redirectPath.startsWith("//") && redirectPath !== "/login" && redirectPath !== "/register"
      ? redirectPath
      : "/dashboard";

  const response = NextResponse.redirect(new URL(safePath, request.url));

  // Determine cookie domain: for custom domains (*.copilotmarketing.id), share cookie across subdomains
  const cookieDomain = cleanHost.endsWith("copilotmarketing.id")
    ? ".copilotmarketing.id"
    : undefined;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  response.cookies.set("fairshare_session", verification.sessionId, {
    httpOnly: true,
    secure: !isLocal,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });

  return response;
}
