import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { verifyAdminApiRequest } from "@/lib/api/auth";
import { hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// PATCH /api/v1/admin/users/[id]
// AI Agent updates user role or resets password
export async function PATCH(req: NextRequest, { params }: RouteProps) {
  const auth = await verifyAdminApiRequest(req, "admin:manage");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    const updates: Partial<{
      name: string;
      role: string;
      passwordHash: string;
    }> = {};

    if (body.name && typeof body.name === "string") {
      updates.name = body.name.trim();
    }

    if (body.role && (body.role === "user" || body.role === "admin")) {
      // Prevent self demote if using token linked to current user
      if (auth.user?.id === id && body.role !== "admin") {
        return NextResponse.json(
          {
            success: false,
            error: "Tidak dapat mencabut hak akses administrator dari akun Anda sendiri",
          },
          { status: 400 }
        );
      }
      updates.role = body.role;
    }

    if (body.password && typeof body.password === "string") {
      if (body.password.length < 6) {
        return NextResponse.json(
          { success: false, error: "Kata sandi minimal 6 karakter" },
          { status: 400 }
        );
      }
      updates.passwordHash = await hashPassword(body.password);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "Tidak ada bidang perubahan yang diberikan (name, role, password)" },
        { status: 400 }
      );
    }

    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: "Data pengguna berhasil diperbarui",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("PATCH /api/v1/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui pengguna" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/admin/users/[id]
// AI Agent deletes a user
export async function DELETE(req: NextRequest, { params }: RouteProps) {
  const auth = await verifyAdminApiRequest(req, "admin:manage");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const { id } = await params;

    if (auth.user?.id === id) {
      return NextResponse.json(
        { success: false, error: "Tidak dapat menghapus akun Anda sendiri" },
        { status: 400 }
      );
    }

    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    // Ensure last admin safeguard
    if (targetUser.role === "admin") {
      const otherAdmins = await db.query.users.findMany({
        where: and(eq(users.role, "admin"), ne(users.id, id)),
      });

      if (otherAdmins.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Akun ini adalah administrator terakhir. Minimal harus ada 1 administrator aktif.",
          },
          { status: 400 }
        );
      }
    }

    await db.delete(users).where(eq(users.id, id));

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: `Akun ${targetUser.name} (${targetUser.email}) berhasil dihapus`,
    });
  } catch (error: any) {
    console.error("DELETE /api/v1/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus pengguna" },
      { status: 500 }
    );
  }
}
