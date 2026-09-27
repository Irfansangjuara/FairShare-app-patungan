import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { createSession } from "@/lib/auth";
import { ensureDatabaseSchema } from "@/db/migrate";
import {
  verifySignedOAuthState,
  resolveOAuthRedirectUri,
  createSessionSyncToken,
} from "@/lib/oauth-state";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ||
    headerList.get("host") ||
    request.headers.get("host") ||
    "";
  const proto = headerList.get("x-forwarded-proto") || "https";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");

  // Baca cookie dari request cookies dan cookie store
  const cookieStore = await cookies();
  const savedState =
    cookieStore.get("google_oauth_state")?.value ||
    request.cookies.get("google_oauth_state")?.value;
  const savedRedirectUri =
    cookieStore.get("google_oauth_redirect_uri")?.value ||
    request.cookies.get("google_oauth_redirect_uri")?.value;

  // Verifikasi state token secara fleksibel & aman (CSRF protected via HMAC)
  const verification = verifySignedOAuthState(state, savedState);

  // Tentukan Base URL kembali (utamakan origin asli tempat user mulai login)
  let baseUrl: string;
  if (verification.payload?.origin) {
    baseUrl = verification.payload.origin;
  } else if (isLocal) {
    baseUrl = "http://localhost:3000";
  } else if (host) {
    baseUrl = `${proto}://${host}`;
  } else {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app-fairshare.vercel.app";
  }

  // Tangani error dari Google
  if (error) {
    console.error("Google OAuth returned error:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent("Parameter autentikasi tidak lengkap.")}`
    );
  }

  // Jika state gagal diverifikasi
  if (!verification.valid) {
    console.error("OAuth state verification failed:", {
      hasCookie: Boolean(savedState),
      receivedStateLength: state.length,
      host,
    });
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(
        "Validasi sesi OAuth gagal. Silakan coba masuk kembali."
      )}`
    );
  }

  // Tentukan redirect URI yang 100% cocok dengan yang dikirim saat inisiasi
  const redirectUri =
    verification.payload?.redirectUri ||
    savedRedirectUri ||
    resolveOAuthRedirectUri(host);

  // Hapus cookie state lama
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
    // 1. Tukar authorization code dengan access token Google
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
        `${baseUrl}/login?error=${encodeURIComponent(
          "Gagal menukar token dengan Google. Silakan coba lagi."
        )}`
      );
    }

    const tokens = await tokenRes.json();

    // 2. Ambil profil pengguna dari Google UserInfo API
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
        `${baseUrl}/login?error=${encodeURIComponent(
          "Akun Google Anda tidak menyediakan alamat email."
        )}`
      );
    }

    // 3. AUTO-REGISTER / UPSERT PENGGUNA DI DATABASE
    // Jika akun belum pernah ada di database, OTOMATIS TER-REGISTER!
    await ensureDatabaseSchema();
    const normalizedEmail = email.toLowerCase().trim();
    const displayName =
      (name && name.trim()) || normalizedEmail.split("@")[0] || "Pengguna FairShare";

    // Cari akun berdasarkan googleId atau email
    const existingUser = await db.query.users.findFirst({
      where: or(eq(users.googleId, googleId), eq(users.email, normalizedEmail)),
    });

    let userId: string;

    if (existingUser) {
      // User sudah terdaftar: update googleId dan avatar
      userId = existingUser.id;
      await db
        .update(users)
        .set({
          googleId,
          name: existingUser.name || displayName.slice(0, 120),
          avatarUrl: avatarUrl || existingUser.avatarUrl,
        })
        .where(eq(users.id, userId));
    } else {
      // User BELUM ada di database: OTOMATIS REGISTER sebagai pengguna baru!
      try {
        const [newUser] = await db
          .insert(users)
          .values({
            googleId,
            email: normalizedEmail,
            name: displayName.slice(0, 120),
            avatarUrl: avatarUrl || null,
            role: "user",
          })
          .returning({ id: users.id });

        userId = newUser.id;
        console.log("✓ Pengguna baru berhasil ter-register otomatis via Google OAuth:", {
          userId,
          email: normalizedEmail,
        });
      } catch (insertErr) {
        // Fallback jika terjadi request bersamaan
        const retryUser = await db.query.users.findFirst({
          where: or(eq(users.googleId, googleId), eq(users.email, normalizedEmail)),
        });
        if (retryUser) {
          userId = retryUser.id;
        } else {
          throw insertErr;
        }
      }
    }

    // 4. Buat sesi login lokal
    const { sessionId, expiresAt } = await createSession(userId);

    // 5. Redirect ke dashboard (atau halaman tujuan yang diinginkan)
    let targetPath =
      verification.payload?.redirectPath && verification.payload.redirectPath.startsWith("/")
        ? verification.payload.redirectPath
        : "/dashboard";

    // Pastikan tidak me-redirect balik ke halaman login/register
    if (targetPath === "/login" || targetPath === "/register") {
      targetPath = "/dashboard";
    }

    const cleanHost = host.toLowerCase().split(":")[0];
    const cookieDomain = cleanHost.endsWith("copilotmarketing.id")
      ? ".copilotmarketing.id"
      : undefined;

    // Cek apakah baseUrl (origin awal user) berbeda domain dari host callback saat ini
    const targetOrigin = baseUrl;
    const isDifferentOrigin = targetOrigin && !targetOrigin.includes(cleanHost);

    let destinationUrl: string;
    if (isDifferentOrigin) {
      // Sinkronisasi sesi otomatis lintas domain dengan token berumur pendek (2 menit)
      const syncToken = createSessionSyncToken(sessionId);
      destinationUrl = `${targetOrigin}/api/auth/session-sync?token=${syncToken}&redirect=${encodeURIComponent(targetPath)}`;
    } else {
      destinationUrl = `${targetOrigin}${targetPath}`;
    }

    const response = NextResponse.redirect(destinationUrl);

    // Bersihkan cookie OAuth lama
    response.cookies.delete("google_oauth_state");
    response.cookies.delete("google_oauth_redirect_uri");

    // Simpan cookie sesi login secara eksplisit pada response
    response.cookies.set("fairshare_session", sessionId, {
      httpOnly: true,
      secure: !isLocal,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    });

    return response;
  } catch (err: unknown) {
    console.error("Error in Google OAuth callback:", err);
    const anyErr = err as {
      message?: string;
      code?: string;
      cause?: { message?: string; code?: string; detail?: string };
    };
    const combined = `${anyErr?.message || ""} ${anyErr?.cause?.message || ""} ${
      anyErr?.cause?.code || ""
    } ${anyErr?.code || ""}`;

    const isDbErr =
      combined.includes("ECONNREFUSED") ||
      combined.includes("ENOTFOUND") ||
      combined.includes("connect") ||
      combined.includes("5432") ||
      combined.includes("postgres") ||
      combined.includes("DATABASE_URL") ||
      combined.includes("terminating connection") ||
      combined.includes("password authentication failed");

    let userFacingError: string;
    if (isDbErr) {
      userFacingError =
        "Koneksi database PostgreSQL belum terhubung. Pastikan DATABASE_URL sudah diset di Vercel Environment Variables.";
    } else if (anyErr?.cause?.message) {
      userFacingError = `Gagal proses login: ${anyErr.cause.message}`;
    } else {
      userFacingError = `Gagal proses login: ${(anyErr?.message || String(err)).slice(0, 120)}`;
    }

    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(userFacingError)}`
    );
  }
}
