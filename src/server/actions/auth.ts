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
    password: formData.get("password"),
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
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("ECONNREFUSED") ||
      msg.includes("connect") ||
      msg.includes("5432") ||
      msg.includes("postgres") ||
      msg.includes("DATABASE_URL")
    ) {
      return {
        error:
          "Koneksi database PostgreSQL belum terhubung di Vercel. Pastikan DATABASE_URL (seperti Neon/Supabase) sudah diset di Vercel Environment Variables.",
      };
    }
    return { error: `Gagal mendaftarkan akun: ${msg.slice(0, 100)}` };
  }

  redirect("/dashboard");
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
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("ECONNREFUSED") ||
      msg.includes("connect") ||
      msg.includes("5432") ||
      msg.includes("postgres") ||
      msg.includes("DATABASE_URL")
    ) {
      return {
        error:
          "Koneksi database PostgreSQL belum terhubung di Vercel. Pastikan DATABASE_URL (seperti Neon/Supabase) sudah diset di Vercel Environment Variables.",
      };
    }
    return { error: `Gagal masuk: ${msg.slice(0, 100)}` };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
