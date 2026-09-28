"use server";

import { db } from "../../db";
import { users } from "../../db/schema";
import { eq, or, inArray } from "drizzle-orm";
import { hashPassword, verifyPassword, createSession, destroySession } from "../../lib/auth";
import { registerSchema, loginSchema } from "../../lib/validation";
import { normalizePhoneNumber, getPhoneVariants } from "../../lib/phone";
import { getClientIp } from "../../lib/client-ip";
import { rateLimit, resetRateLimit, sweepRateLimits } from "../../lib/rate-limit";
import { redirect } from "next/navigation";
import { ensureDatabaseSchema } from "../../db/migrate";

export interface ActionState {
  error?: string;
  success?: boolean;
}

/**
 * Uniform credential-failure message. Distinct messages for "unknown account",
 * "Google-only account" and "wrong password" turn the login form into an
 * account-enumeration oracle, so every failure path returns this string.
 */
const INVALID_CREDENTIALS = "Email/nomor WhatsApp atau kata sandi salah.";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPTS_PER_IDENTIFIER = 8;
const LOGIN_ATTEMPTS_PER_IP = 40;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;
const REGISTER_ATTEMPTS_PER_IP = 10;

function throttledMessage(retryAfterSeconds: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return `Terlalu banyak percobaan. Silakan coba lagi dalam ${minutes} menit.`;
}

export async function registerAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  sweepRateLimits();
  const ip = await getClientIp();
  const registerLimit = rateLimit(`register:${ip}`, REGISTER_ATTEMPTS_PER_IP, REGISTER_WINDOW_MS);
  if (!registerLimit.allowed) {
    return { error: throttledMessage(registerLimit.retryAfterSeconds) };
  }

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
    password_confirmation: formData.get("password_confirmation") || undefined,
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;
  const rawPhone = parsed.data.phone?.trim() || null;
  const phone = rawPhone ? normalizePhoneNumber(rawPhone) : null;

  try {
    await ensureDatabaseSchema();

    // Check if email already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existing) {
      return { error: "Email sudah terdaftar. Silakan masuk menggunakan email tersebut." };
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const phoneVariants = getPhoneVariants(phone);
      if (phoneVariants.length > 0) {
        const existingPhone = await db.query.users.findFirst({
          where: inArray(users.phone, phoneVariants),
        });

        if (existingPhone) {
          return { error: "Nomor WhatsApp sudah terdaftar. Silakan gunakan nomor lain atau masuk." };
        }
      }
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        phone,
        passwordHash,
      })
      .returning({ id: users.id });

    await createSession(newUser.id);
  } catch (err: unknown) {
    console.error("registerAction error:", err);
    return { error: extractAuthError(err, "Gagal mendaftarkan akun") };
  }

  redirect("/dashboard");
}

function extractAuthError(err: unknown, defaultPrefix: string): string {
  const anyErr = err as {
    message?: string;
    code?: string;
    cause?: { message?: string; code?: string; detail?: string; hint?: string };
    digest?: string;
  };

  // Never swallow Next.js control-flow signals (redirect / notFound).
  if (anyErr?.digest?.startsWith("NEXT_REDIRECT") || anyErr?.digest?.startsWith("NEXT_NOT_FOUND")) {
    throw err;
  }

  const causeMessage = anyErr?.cause?.message || anyErr?.cause?.detail || "";
  const errMessage = anyErr?.message || String(err);
  const combined = `${errMessage} ${causeMessage} ${anyErr?.cause?.code || ""} ${anyErr?.code || ""}`;

  if (
    combined.includes("ECONNREFUSED") ||
    combined.includes("ENOTFOUND") ||
    combined.includes("5432") ||
    combined.includes("connect") ||
    combined.includes("DATABASE_URL") ||
    combined.includes("terminating connection") ||
    combined.includes("password authentication failed") ||
    combined.includes("no pg_hba.conf entry")
  ) {
    return "Koneksi database PostgreSQL belum terhubung di Vercel. Pastikan DATABASE_URL (seperti Neon/Supabase) sudah diset di Vercel Environment Variables dan database aktif.";
  }

  // Log the detail, but never reflect raw database errors back to the client.
  console.error(`${defaultPrefix}:`, causeMessage || errMessage);
  return defaultPrefix;
}

export async function loginAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  sweepRateLimits();

  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email: identifier, password } = parsed.data;
  const trimmed = identifier.trim();
  const isEmail = trimmed.includes("@");
  const normalizedIdentifier = trimmed.toLowerCase();

  const ip = await getClientIp();
  const identifierLimit = rateLimit(
    `login:id:${normalizedIdentifier}`,
    LOGIN_ATTEMPTS_PER_IDENTIFIER,
    LOGIN_WINDOW_MS
  );
  const ipLimit = rateLimit(`login:ip:${ip}`, LOGIN_ATTEMPTS_PER_IP, LOGIN_WINDOW_MS);
  if (!identifierLimit.allowed || !ipLimit.allowed) {
    return {
      error: throttledMessage(
        Math.max(identifierLimit.retryAfterSeconds, ipLimit.retryAfterSeconds)
      ),
    };
  }

  try {
    await ensureDatabaseSchema();

    let user;
    if (isEmail) {
      user = await db.query.users.findFirst({
        where: eq(users.email, normalizedIdentifier),
      });
    } else {
      const phoneVariants = getPhoneVariants(trimmed);
      user = await db.query.users.findFirst({
        where: or(
          phoneVariants.length > 0 ? inArray(users.phone, phoneVariants) : undefined,
          eq(users.email, normalizedIdentifier)
        ),
      });
    }

    if (!user || !user.passwordHash) {
      return { error: INVALID_CREDENTIALS };
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return { error: INVALID_CREDENTIALS };
    }

    resetRateLimit(`login:id:${normalizedIdentifier}`);
    await createSession(user.id);
  } catch (err: unknown) {
    console.error("loginAction error:", err);
    return { error: extractAuthError(err, "Gagal masuk") };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function adminLoginAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  sweepRateLimits();

  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const ip = await getClientIp();
  const identifierLimit = rateLimit(
    `admin-login:id:${normalizedEmail}`,
    LOGIN_ATTEMPTS_PER_IDENTIFIER,
    LOGIN_WINDOW_MS
  );
  const ipLimit = rateLimit(`admin-login:ip:${ip}`, LOGIN_ATTEMPTS_PER_IP, LOGIN_WINDOW_MS);
  if (!identifierLimit.allowed || !ipLimit.allowed) {
    return {
      error: throttledMessage(
        Math.max(identifierLimit.retryAfterSeconds, ipLimit.retryAfterSeconds)
      ),
    };
  }

  try {
    await ensureDatabaseSchema();

    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (!user || !user.passwordHash) {
      return { error: "Email atau kata sandi administrator salah." };
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return { error: "Email atau kata sandi administrator salah." };
    }

    if (user.role !== "admin") {
      return {
        error:
          "Akses Ditolak: Akun Anda terdaftar sebagai pengguna biasa. Portal ini hanya untuk Administrator.",
      };
    }

    resetRateLimit(`admin-login:id:${normalizedEmail}`);
    await createSession(user.id);
  } catch (err: unknown) {
    console.error("adminLoginAction error:", err);
    return { error: extractAuthError(err, "Gagal masuk sebagai admin") };
  }

  redirect("/admin");
}

export async function adminLogoutAction() {
  await destroySession();
  redirect("/admin");
}
