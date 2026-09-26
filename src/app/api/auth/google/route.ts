import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const baseUrl = isLocal ? "http://localhost:3000" : "https://app-fairshare.vercel.app";

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(
        "GOOGLE_CLIENT_ID belum diset di Vercel. Silakan tambahkan GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET di Vercel Environment Variables."
      )}`
    );
  }

  // Determine matching redirect URI
  const redirectUri = isLocal
    ? "http://localhost:3000/api/auth/google/callback"
    : (process.env.GOOGLE_REDIRECT_URI || "https://app-fairshare.vercel.app/api/auth/google/callback");

  // Generate random state to protect against CSRF
  const state = crypto.randomBytes(16).toString("hex");

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
    maxAge: 60 * 10, // 10 minutes
  });

  response.cookies.set("google_oauth_redirect_uri", redirectUri, {
    httpOnly: true,
    secure: !isLocal,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}

