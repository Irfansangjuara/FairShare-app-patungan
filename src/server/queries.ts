import { db } from "../db";
import { events, members, expenses, settlements, users } from "../db/schema";
import { eq, and, desc, asc, isNull } from "drizzle-orm";
import { calculateSplitAndSettlements } from "../lib/settlement";

export async function getUserEvents(userId: string) {
  const userEvents = await db.query.events.findMany({
    where: eq(events.ownerId, userId),
    orderBy: [desc(events.createdAt)],
    with: {
      members: true,
      expenses: true,
      settlements: true,
    },
  });

  return userEvents.map((evt) => {
    const totalAmount = evt.expenses.reduce((sum, e) => sum + e.amount, BigInt(0));
    const unpaidCount = evt.settlements.filter((s) => !s.isPaid).length;
    return {
      ...evt,
      totalAmount,
      memberCount: evt.members.length,
      expenseCount: evt.expenses.length,
      settlementCount: evt.settlements.length,
      unpaidCount,
      isArchived: !!evt.archivedAt,
    };
  });
}

export async function getEventDetails(eventId: string, userId: string) {
  const event = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.ownerId, userId)),
    with: {
      members: {
        orderBy: [asc(members.createdAt), asc(members.id)],
      },
      expenses: {
        orderBy: [desc(expenses.createdAt)],
        with: {
          paidByMember: true,
        },
      },
      settlements: {
        orderBy: [asc(settlements.createdAt), asc(settlements.id)],
        with: {
          fromMember: true,
          toMember: true,
        },
      },
    },
  });

  if (!event) return null;

  // Compute live calculations
  const splitResult = calculateSplitAndSettlements(
    event.members.map((m) => ({ id: m.id, name: m.name, createdAt: m.createdAt })),
    event.expenses.map((e) => ({
      id: e.id,
      paidByMemberId: e.paidByMemberId,
      amount: e.amount,
      title: e.title,
    }))
  );

  const hasPaidSettlements = event.settlements.some((s) => s.isPaid);
  const unpaidCount = event.settlements.filter((s) => !s.isPaid).length;

  return {
    event,
    splitResult,
    hasPaidSettlements,
    unpaidCount,
    isOwner: true,
  };
}

export async function getEventByShareToken(token: string) {
  const event = await db.query.events.findFirst({
    where: eq(events.shareToken, token),
    with: {
      members: {
        orderBy: [asc(members.createdAt), asc(members.id)],
      },
      expenses: {
        orderBy: [desc(expenses.createdAt)],
        with: {
          paidByMember: true,
        },
      },
      settlements: {
        orderBy: [asc(settlements.createdAt), asc(settlements.id)],
        with: {
          fromMember: true,
          toMember: true,
        },
      },
      owner: {
        columns: {
          name: true,
        },
      },
    },
  });

  if (!event) return null;

  const splitResult = calculateSplitAndSettlements(
    event.members.map((m) => ({ id: m.id, name: m.name, createdAt: m.createdAt })),
    event.expenses.map((e) => ({
      id: e.id,
      paidByMemberId: e.paidByMemberId,
      amount: e.amount,
      title: e.title,
    }))
  );

  const unpaidCount = event.settlements.filter((s) => !s.isPaid).length;

  return {
    event,
    splitResult,
    unpaidCount,
    isOwner: false,
  };
}
