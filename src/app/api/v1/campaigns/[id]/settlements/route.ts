import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api/auth";
import { db } from "@/db";
import { events, settlements, members } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await verifyApiRequest(req, "read:settlements");
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id: eventId } = await params;

  try {
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, eventId), eq(events.ownerId, auth.user.id)),
      with: {
        settlements: {
          orderBy: [asc(settlements.createdAt)],
          with: {
            fromMember: true,
            toMember: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event tidak ditemukan atau tidak memiliki hak akses." },
        { status: 404 }
      );
    }

    const data = event.settlements.map((s) => ({
      id: s.id,
      fromMemberId: s.fromMemberId,
      fromMemberName: s.fromMember.name,
      toMemberId: s.toMemberId,
      toMemberName: s.toMember.name,
      toMemberBankAccount: s.toMember.bankAccount,
      amount: Number(s.amount),
      isPaid: s.isPaid,
      paidAt: s.paidAt,
    }));

    return NextResponse.json({
      success: true,
      eventId: event.id,
      eventTitle: event.title,
      totalSettlements: data.length,
      unpaidSettlements: data.filter((s) => !s.isPaid).length,
      settlements: data,
    });
  } catch (err: unknown) {
    console.error("GET /api/v1/campaigns/[id]/settlements error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
