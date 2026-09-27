import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api/auth";
import { db } from "@/db";
import { events, members, expenses, settlements } from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { calculateSplitAndSettlements } from "@/lib/settlement";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await verifyApiRequest(req, "read:campaigns");
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id: eventId } = await params;

  try {
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, eventId), eq(events.ownerId, auth.user.id)),
      with: {
        members: {
          orderBy: [asc(members.createdAt)],
        },
        expenses: {
          orderBy: [desc(expenses.createdAt)],
          with: {
            paidByMember: true,
          },
        },
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

    const split = calculateSplitAndSettlements(
      event.members.map((m) => ({ id: m.id, name: m.name, createdAt: m.createdAt })),
      event.expenses.map((e) => ({
        id: e.id,
        paidByMemberId: e.paidByMemberId,
        amount: e.amount,
        title: e.title,
      }))
    );

    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        title: event.title,
        location: event.location,
        eventDate: event.eventDate,
        totalAmount: Number(split.totalAmount),
        baseShare: Number(split.baseShare),
        remainder: Number(split.remainder),
        members: event.members.map((m) => ({
          id: m.id,
          name: m.name,
          bankAccount: m.bankAccount,
        })),
        expenses: event.expenses.map((e) => ({
          id: e.id,
          title: e.title,
          category: e.category,
          amount: Number(e.amount),
          paidByMemberId: e.paidByMemberId,
          paidByName: e.paidByMember?.name,
          createdAt: e.createdAt,
        })),
        memberBalances: split.memberCalculations.map((m) => ({
          memberId: m.memberId,
          name: m.name,
          paid: Number(m.paid),
          share: Number(m.share),
          balance: Number(m.balance),
        })),
        settlements: event.settlements.map((s) => ({
          id: s.id,
          fromMemberName: s.fromMember.name,
          toMemberName: s.toMember.name,
          toMemberBankAccount: s.toMember.bankAccount,
          amount: Number(s.amount),
          isPaid: s.isPaid,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Internal server error: ${err?.message}` },
      { status: 500 }
    );
  }
}
