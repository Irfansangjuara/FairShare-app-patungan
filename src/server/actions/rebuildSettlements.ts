import { db } from "../../db";
import { members, expenses, settlements } from "../../db/schema";
import { eq, asc } from "drizzle-orm";
import { calculateSplitAndSettlements } from "../../lib/settlement";

export async function rebuildEventSettlements(eventId: string) {
  // Check if any settlement is paid
  const existingSettlements = await db.query.settlements.findMany({
    where: eq(settlements.eventId, eventId),
  });

  const hasPaid = existingSettlements.some((s) => s.isPaid);
  if (hasPaid) {
    throw new Error(
      "Ada transfer yang sudah ditandai Lunas. Batalkan status lunas terlebih dahulu untuk mengubah atau menambah pengeluaran."
    );
  }

  // Fetch all members
  const allMembers = await db.query.members.findMany({
    where: eq(members.eventId, eventId),
    orderBy: [asc(members.createdAt), asc(members.id)],
  });

  // Fetch all expenses
  const allExpenses = await db.query.expenses.findMany({
    where: eq(expenses.eventId, eventId),
  });

  const { settlements: recommended } = calculateSplitAndSettlements(
    allMembers.map((m) => ({ id: m.id, name: m.name, createdAt: m.createdAt })),
    allExpenses.map((e) => ({
      id: e.id,
      paidByMemberId: e.paidByMemberId,
      amount: e.amount,
      title: e.title,
    }))
  );

  // Atomically replace settlements
  await db.transaction(async (tx) => {
    await tx.delete(settlements).where(eq(settlements.eventId, eventId));

    if (recommended.length > 0) {
      await tx.insert(settlements).values(
        recommended.map((r) => ({
          eventId,
          fromMemberId: r.fromMemberId,
          toMemberId: r.toMemberId,
          amount: r.amount,
          isPaid: false,
          calculationVersion: 1,
        }))
      );
    }
  });
}
