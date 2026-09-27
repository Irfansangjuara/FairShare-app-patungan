import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAdminApiRequest } from "@/lib/api/auth";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

// GET /api/v1/admin/users
// AI Agent lists all registered users
export async function GET(req: NextRequest) {
  const auth = await verifyAdminApiRequest(req, "admin:manage");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
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

    const data = list.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || "user",
      createdAt: u.createdAt,
      eventCount: u.events ? u.events.length : 0,
    }));

    return NextResponse.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error: any) {
    console.error("GET /api/v1/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil daftar pengguna" },
      { status: 500 }
    );
  }
}

// POST /api/v1/admin/users
// AI Agent creates new user or administrator
export async function POST(req: NextRequest) {
  const auth = await verifyAdminApiRequest(req, "admin:manage");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validasi gagal", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const emailClean = parsed.data.email.toLowerCase().trim();

    // Check duplicate email
    const existing = await db.query.users.findFirst({
      where: eq(users.email, emailClean),
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Email "${emailClean}" sudah terdaftar.` },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const role = body.role === "admin" ? "admin" : "user";

    const [newUser] = await db
      .insert(users)
      .values({
        name: parsed.data.name.trim(),
        email: emailClean,
        passwordHash,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return NextResponse.json(
      {
        success: true,
        message: "Pengguna berhasil dibuat",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/v1/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat pengguna baru" },
      { status: 500 }
    );
  }
}
