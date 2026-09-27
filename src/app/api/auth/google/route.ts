import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { generateSignedOAuthState } from "@/lib/oauth-state";

export async function GET(request: NextRequest) {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ||
    headerList.get("host") ||
    request.headers.get("host") ||
    "";
  const proto = headerList.get("x-forwarded-proto") || "https";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");

  // Determine current Base URL dynamically (e.g. fairshare.copilotmarketing.id or localhost)
  let baseUrl: string;
  if (isLocal) {
    baseUrl = "http://localhost:3000";
  } else if (host) {
    baseUrl = `${proto}://${host}`;
  } else {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app-fairshare.vercel.app";
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(
        "GOOGLE_CLIENT_ID belum diset di Vercel Environment Variables. Silakan tambahkan GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET."
      )}`
    );
  }

  // Determine exact matching redirect URI
  let redirectUri: string;
  if (isLocal) {
    redirectUri = "http://localhost:3000/api/auth/google/callback";
  } else if (
    process.env.GOOGLE_REDIRECT_URI &&
    !process.env.GOOGLE_REDIRECT_URI.includes("localhost")
  ) {
    redirectUri = process.env.GOOGLE_REDIRECT_URI;
  } else if (host.includes("copilotmarketing.id")) {
    redirectUri = "https://fairshare.copilotmarketing.id/api/auth/google/callback";
  } else if (host.includes("www.app-fairshare.vercel.app")) {
    redirectUri = "https://www.app-fairshare.vercel.app/api/auth/google/callback";
  } else if (host.includes("vercel.app")) {
    redirectUri = `https://${host}/api/auth/google/callback`;
  } else {
    redirectUri = "https://app-fairshare.vercel.app/api/auth/google/callback";
  }

  const redirectPath = request.nextUrl.searchParams.get("redirect") || "/dashboard";

  // Generate cryptographically signed state token (tamper-proof & resilient to cross-domain cookie loss)
  const state = generateSignedOAuthState(baseUrl, redirectUri, redirectPath);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  const response = NextResponse.redirect(googleAuthUrl);

  // Set cookies explicitly on the response object
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: !isLocal,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutes
  });

  response.cookies.set("google_oauth_redirect_uri", redirectUri, {
    httpOnly: true,
    secure: !isLocal,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  return response;
}
