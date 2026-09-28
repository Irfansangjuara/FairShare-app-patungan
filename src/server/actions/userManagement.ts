"use server";

import { db } from "@/db";
import { users, events } from "@/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export interface UserActionState {
  error?: string;
  success?: boolean;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  createdAt: Date;
  eventCount: number;
}

// 1. Fetch all users (Admin only)
export async function getAllUsersAction(): Promise<UserListItem[]> {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin") {
    return [];
  }

  try {
    const list = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      with: {
        events: {
          columns: {
            id: true,
          },
        },
      },
    });

    return list.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || null,
      role: u.role || "user",
      createdAt: u.createdAt,
      eventCount: u.events ? u.events.length : 0,
    }));
  } catch (err) {
    console.error("Error fetching users:", err);
    return [];
  }
}

// 2. Create User/Admin (Admin only)
export async function createUserAction(
  _prevState: UserActionState | null,
  formData: FormData
): Promise<UserActionState> {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin") {
    return { error: "Akses ditolak. Hanya administrator yang dapat menambah pengguna." };
  }

  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const role = (formData.get("role") || "user") as "user" | "admin";

  const parsed = registerSchema.safeParse({ name, email, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const emailClean = parsed.data.email.toLowerCase().trim();

  // Check duplicate email
  const existing = await db.query.users.findFirst({
    where: eq(users.email, emailClean),
  });

  if (existing) {
    return { error: `Pengguna dengan email "${emailClean}" sudah terdaftar.` };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await db.insert(users).values({
    name: parsed.data.name.trim(),
    email: emailClean,
    passwordHash,
    role: role === "admin" ? "admin" : "user",
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true };
}

// 3. Update User Role (Admin only)
export async function updateUserRoleAction(
  targetUserId: string,
  newRole: "user" | "admin"
): Promise<UserActionState> {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin") {
    return { error: "Akses ditolak. Hanya administrator yang dapat mengubah role." };
  }

  // Prevent self-demote if currently logged in
  if (admin.id === targetUserId && newRole !== "admin") {
    return {
      error: "Anda tidak dapat mencabut hak akses administrator dari akun Anda sendiri.",
    };
  }

  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
  });

  if (!targetUser) {
    return { error: "Pengguna tidak ditemukan." };
  }

  await db
    .update(users)
    .set({ role: newRole })
    .where(eq(users.id, targetUserId));

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true };
}

// 4. Reset User Password (Admin only)
export async function resetUserPasswordAction(
  targetUserId: string,
  newPassword: string
): Promise<UserActionState> {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin") {
    return { error: "Akses ditolak. Hanya administrator yang dapat mereset kata sandi." };
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: "Kata sandi baru minimal 6 karakter." };
  }

  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
  });

  if (!targetUser) {
    return { error: "Pengguna tidak ditemukan." };
  }

  const passwordHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, targetUserId));

  revalidatePath("/admin/users");
  return { success: true };
}

// 5. Delete User (Admin only)
export async function deleteUserAction(targetUserId: string): Promise<UserActionState> {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin") {
    return { error: "Akses ditolak. Hanya administrator yang dapat menghapus akun pengguna." };
  }

  // Prevent self-deletion
  if (admin.id === targetUserId) {
    return { error: "Anda tidak dapat menghapus akun Anda sendiri saat sedang masuk." };
  }

  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
  });

  if (!targetUser) {
    return { error: "Pengguna tidak ditemukan." };
  }

  // Ensure there is at least one other admin remaining if deleting an admin
  if (targetUser.role === "admin") {
    const otherAdmins = await db.query.users.findMany({
      where: and(eq(users.role, "admin"), ne(users.id, targetUserId)),
    });

    if (otherAdmins.length === 0) {
      return {
        error: "Akun ini adalah administrator terakhir. Minimal harus ada 1 administrator aktif di sistem.",
      };
    }
  }

  await db.delete(users).where(eq(users.id, targetUserId));

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true };
}
