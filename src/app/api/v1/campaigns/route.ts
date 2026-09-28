import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api/auth";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const auth = await verifyApiRequest(req, "read:campaigns");
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const userEvents = await db.query.events.findMany({
      where: eq(events.ownerId, auth.user.id),
      orderBy: [desc(events.createdAt)],
      with: {
        members: true,
        expenses: true,
        settlements: true,
      },
    });

    const data = userEvents.map((evt) => {
      const totalAmount = evt.expenses.reduce((s, e) => s + e.amount, BigInt(0));
      const unpaidCount = evt.settlements.filter((s) => !s.isPaid).length;

      return {
        id: evt.id,
        title: evt.title,
        location: evt.location,
        eventDate: evt.eventDate,
        totalAmount: Number(totalAmount),
        memberCount: evt.members.length,
        expenseCount: evt.expenses.length,
        settlementCount: evt.settlements.length,
        unpaidCount,
        isArchived: Boolean(evt.archivedAt),
        createdAt: evt.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err: unknown) {
    console.error("GET /api/v1/campaigns error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
