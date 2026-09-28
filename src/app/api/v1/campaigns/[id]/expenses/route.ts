import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api/auth";
import { db } from "@/db";
import { events, members, expenses, settlements } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { rebuildEventSettlements } from "@/server/actions/rebuildSettlements";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = await verifyApiRequest(req, "write:expenses");
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id: eventId } = await params;

  try {
    const body = await req.json();
    const { title, amount, paidByMemberId, category } = body;

    // 1. Verify event ownership
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, eventId), eq(events.ownerId, auth.user.id)),
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event tidak ditemukan atau tidak memiliki hak akses." },
        { status: 404 }
      );
    }

    // 2. Business Rule: Check if any settlement is already paid
    const existingSettlements = await db.query.settlements.findMany({
      where: eq(settlements.eventId, eventId),
    });

    if (existingSettlements.some((s) => s.isPaid)) {
      return NextResponse.json(
        {
          error:
            "Aksi ditolak: Ada transfer yang sudah berstatus Lunas pada event ini. Batalkan status lunas terlebih dahulu sebelum mencatat pengeluaran baru.",
        },
        { status: 409 }
      );
    }

    // 3. Business Rule: Min 2 members
    const allMembers = await db.query.members.findMany({
      where: eq(members.eventId, eventId),
    });

    if (allMembers.length < 2) {
      return NextResponse.json(
        {
          error:
            "Event membutuhkan minimal 2 peserta sebelum pengeluaran dapat dicatat.",
        },
        { status: 400 }
      );
    }

    // 4. Validate fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Field 'title' (deskripsi pengeluaran) wajib diisi." },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    const isAmountValid =
      amount !== undefined &&
      amount !== null &&
      amount !== "" &&
      Number.isFinite(numericAmount) &&
      Number.isInteger(numericAmount) &&
      numericAmount > 0;

    if (!isAmountValid) {
      return NextResponse.json(
        { error: "Field 'amount' harus berupa angka positif integer Rupiah." },
        { status: 400 }
      );
    }

    const nominal = BigInt(numericAmount);

    // 5. Verify payer
    const payer = allMembers.find((m) => m.id === paidByMemberId);
    if (!payer) {
      return NextResponse.json(
        {
          error: `Peserta dengan ID '${paidByMemberId}' tidak ditemukan dalam event ini. Peserta yang valid: ${allMembers.map((m) => `${m.name} (${m.id})`).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const cleanCategory =
      typeof category === "string" && category.trim() ? category.trim() : "Umum";

    // Insert expense
    const [inserted] = await db
      .insert(expenses)
      .values({
        eventId,
        paidByMemberId,
        title: title.trim(),
        category: cleanCategory,
        amount: nominal,
      })
      .returning();

    // Atomically rebuild settlements
    await rebuildEventSettlements(eventId);

    return NextResponse.json(
      {
        success: true,
        message: "Pengeluaran berhasil dicatat dan pelunasan telah dihitung ulang secara deterministik.",
        data: {
          id: inserted.id,
          title: inserted.title,
          category: inserted.category,
          amount: Number(inserted.amount),
          paidByMember: payer.name,
          createdAt: inserted.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("POST /api/v1/campaigns/[id]/expenses error:", err);
    return NextResponse.json(
      { error: "Gagal memproses request." },
      { status: 500 }
    );
  }
}
