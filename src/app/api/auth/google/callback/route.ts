import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { createSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin || "http://localhost:3000";

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
      `${baseUrl}/login?error=${encodeURIComponent("Validasi sesi OAuth gagal. Silakan coba lagi.")}`
    );
  }

  // Clear state cookie
  cookieStore.delete("google_oauth_state");

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/api/auth/google/callback`;

  try {
    // 1. Exchange code for tokens
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
        `${baseUrl}/login?error=${encodeURIComponent("Gagal menukar token dengan Google.")}`
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
        `${baseUrl}/login?error=${encodeURIComponent("Akun Google tidak menyediakan email.")}`
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
    await createSession(userId);

    // 5. Redirect to dashboard
    return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch (err) {
    console.error("Error in Google OAuth callback:", err);
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent("Terjadi kesalahan sistem saat proses masuk.")}`
    );
  }
}
