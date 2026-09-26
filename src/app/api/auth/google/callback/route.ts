import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { createSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const baseUrl = isLocal ? "http://localhost:3000" : "https://app-fairshare.vercel.app";

  if (error) {
    console.error("Google OAuth returned error:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent("Parameter autentikasi tidak lengkap.")}`
    );
  }

  // Validate state
  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;

  if (!savedState || savedState !== state) {
    console.error("OAuth state mismatch:", { savedState, state });
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent("Validasi sesi OAuth gagal. Silakan coba masuk kembali.")}`
    );
  }

  // Retrieve matching redirect URI used in initiation
  const savedRedirectUri = cookieStore.get("google_oauth_redirect_uri")?.value;
  const redirectUri =
    savedRedirectUri ||
    (isLocal
      ? "http://localhost:3000/api/auth/google/callback"
      : (process.env.GOOGLE_REDIRECT_URI || "https://app-fairshare.vercel.app/api/auth/google/callback"));

  // Clean up cookies
  cookieStore.delete("google_oauth_state");
  cookieStore.delete("google_oauth_redirect_uri");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(
        "Kredensial GOOGLE_CLIENT_ID atau GOOGLE_CLIENT_SECRET belum diset di Vercel Environment Variables."
      )}`
    );
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("Token exchange failed:", errBody);
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("Gagal menukar token dengan Google: " + errBody)}`
      );
    }

    const tokens = await tokenRes.json();

    // 2. Fetch user profile from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      console.error("Failed to fetch user profile from Google");
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("Gagal mengambil profil dari Google.")}`
      );
    }

    const googleProfile = await userRes.json();
    const { sub: googleId, email, name, picture: avatarUrl } = googleProfile;

    if (!email) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("Akun Google Anda tidak menyediakan alamat email.")}`
      );
    }

    // 3. Upsert user in database
    const normalizedEmail = email.toLowerCase();
    const existingUser = await db.query.users.findFirst({
      where: or(eq(users.googleId, googleId), eq(users.email, normalizedEmail)),
    });

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      await db
        .update(users)
        .set({
          googleId,
          name: name || existingUser.name,
          avatarUrl: avatarUrl || existingUser.avatarUrl,
        })
        .where(eq(users.id, userId));
    } else {
      const [newUser] = await db
        .insert(users)
        .values({
          googleId,
          email: normalizedEmail,
          name: name || "Pengguna FairShare",
          avatarUrl,
        })
        .returning({ id: users.id });
      userId = newUser.id;
    }

    // 4. Create local session
    const { sessionId, expiresAt } = await createSession(userId);

    // 5. Redirect to dashboard with explicit session cookie on the response
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    response.cookies.delete("google_oauth_state");
    response.cookies.delete("google_oauth_redirect_uri");
    response.cookies.set("fairshare_session", sessionId, {
      httpOnly: true,
      secure: !isLocal,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (err: unknown) {
    console.error("Error in Google OAuth callback:", err);
    const errMsg = err instanceof Error ? err.message : String(err);
    const isDbErr =
      errMsg.includes("ECONNREFUSED") ||
      errMsg.includes("connect") ||
      errMsg.includes("5432") ||
      errMsg.includes("postgres") ||
      errMsg.includes("DATABASE_URL");

    const userFacingError = isDbErr
      ? "Koneksi database PostgreSQL belum terhubung di Vercel. Pastikan DATABASE_URL (seperti Neon/Supabase) sudah diset di Vercel Environment Variables."
      : `Gagal proses login: ${errMsg.slice(0, 100)}`;

    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(userFacingError)}`
    );
  }
}

