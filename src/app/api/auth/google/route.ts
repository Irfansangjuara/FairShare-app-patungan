import { NextRequest } from "next/server";
import { cookies, headers } from "next/headers";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return Response.json(
      { error: "GOOGLE_CLIENT_ID is not configured in environment variables." },
      { status: 500 }
    );
  }

  // Detect host to handle localhost vs production canonical domain
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");

  // Determine matching redirect URI
  const redirectUri = isLocal
    ? "http://localhost:3000/api/auth/google/callback"
    : (process.env.GOOGLE_REDIRECT_URI || "https://app-fairshare.vercel.app/api/auth/google/callback");

  // Generate random state to protect against CSRF
  const state = crypto.randomBytes(16).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: !isLocal,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  cookieStore.set("google_oauth_redirect_uri", redirectUri, {
    httpOnly: true,
    secure: !isLocal,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return Response.redirect(googleAuthUrl);
}
