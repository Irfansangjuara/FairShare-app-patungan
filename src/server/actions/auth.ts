"use server";

import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, createSession, destroySession } from "../../lib/auth";
import { registerSchema, loginSchema } from "../../lib/validation";
import { redirect } from "next/navigation";
import { ensureDatabaseSchema } from "../../db/migrate";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function registerAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
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

  try {
    await ensureDatabaseSchema();

    // Check if email already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existing) {
      return { error: "Email sudah terdaftar. Silakan masuk menggunakan email tersebut." };
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
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
  };

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

  if (causeMessage) {
    return `${defaultPrefix}: ${causeMessage}`;
  }

  if (errMessage.startsWith("Failed query:")) {
    const lines = errMessage.split("\n");
    return `${defaultPrefix}: ${lines[lines.length - 1] || lines[0].slice(0, 120)}`;
  }

  return `${defaultPrefix}: ${errMessage.slice(0, 120)}`;
}

export async function loginAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  try {
    await ensureDatabaseSchema();

    let user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    // Auto-provision admin user if logging in as admin and not yet in database
    if (!user && email.toLowerCase() === "admin@admin.com" && password === "admin#123") {
      const passwordHash = await hashPassword("admin#123");
      const [newAdmin] = await db
        .insert(users)
        .values({
          name: "Administrator",
          email: "admin@admin.com",
          passwordHash,
        })
        .returning();
      user = newAdmin;
    }

    if (!user || !user.passwordHash) {
      return { error: "Email tidak ditemukan atau akun ini terdaftar via Google." };
    }

    // Special bypass for admin credentials
    const isAdminMatch =
      email.toLowerCase() === "admin@admin.com" && password === "admin#123";

    if (!isAdminMatch) {
      const isMatch = await verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        return { error: "Email atau kata sandi salah." };
      }
    }

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
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  try {
    await ensureDatabaseSchema();

    let user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    // Auto-provision admin user if logging in as requested admin or default admin and not yet in database
    const isNewOfficialAdmin =
      email.toLowerCase() === "admin@fairshare.copilotmarketing.id" && password === "#@Cusn77";
    const isLegacyAdmin =
      email.toLowerCase() === "admin@admin.com" && password === "admin#123";

    if (!user && (isNewOfficialAdmin || isLegacyAdmin)) {
      const passwordHash = await hashPassword(password);
      const [newAdmin] = await db
        .insert(users)
        .values({
          name: isNewOfficialAdmin ? "Admin FairShare" : "Administrator",
          email: email.toLowerCase(),
          passwordHash,
          role: "admin",
        })
        .returning();
      user = newAdmin;
    }

    if (user && isNewOfficialAdmin) {
      if (user.role !== "admin") {
        await db.update(users).set({ role: "admin" }).where(eq(users.id, user.id));
        user.role = "admin";
      }
    }

    if (!user || !user.passwordHash) {
      return { error: "Akun administrator tidak ditemukan atau salah." };
    }

    // Special bypass for default admin credentials
    const isAdminMatch = isNewOfficialAdmin || isLegacyAdmin;

    if (!isAdminMatch) {
      const isMatch = await verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        return { error: "Email atau kata sandi administrator salah." };
      }
    }

    // Role check: ONLY admin role can login via admin portal
    if (user.role !== "admin") {
      return {
        error: "Akses Ditolak: Akun Anda terdaftar sebagai pengguna biasa. Portal ini hanya untuk Administrator.",
      };
    }

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

