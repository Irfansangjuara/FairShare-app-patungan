"use server";

import { db } from "../../db";
import { settlements, events } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionUser } from "../../lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleSettlementPaidAction(settlementId: string, eventId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Silakan masuk terlebih dahulu.");
  }

  // Verify event ownership
  const event = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.ownerId, user.id)),
  });

  if (!event) {
    throw new Error("Event tidak ditemukan atau Anda tidak memiliki izin.");
  }

  const existing = await db.query.settlements.findFirst({
    where: and(eq(settlements.id, settlementId), eq(settlements.eventId, eventId)),
  });

  if (!existing) {
    throw new Error("Instruksi transfer tidak ditemukan.");
  }

  const newStatus = !existing.isPaid;

  await db
    .update(settlements)
    .set({
      isPaid: newStatus,
      paidAt: newStatus ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(settlements.id, settlementId));

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
  return { success: true, isPaid: newStatus };
}
