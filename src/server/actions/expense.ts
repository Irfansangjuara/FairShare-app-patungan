"use server";

import { db } from "../../db";
import { expenses, events, members, settlements } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionUser } from "../../lib/auth";
import { expenseSchema } from "../../lib/validation";
import { parseRupiahInput } from "../../lib/money";
import { rebuildEventSettlements } from "./rebuildSettlements";
import { revalidatePath } from "next/cache";

export interface ExpenseActionState {
  error?: string;
  success?: boolean;
}

export async function createExpenseAction(
  eventId: string,
  _prevState: ExpenseActionState | null,
  formData: FormData
): Promise<ExpenseActionState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Silakan masuk terlebih dahulu." };
  }

  // Verify event ownership
  const event = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.ownerId, user.id)),
  });

  if (!event) {
    return { error: "Event tidak ditemukan atau Anda tidak memiliki izin." };
  }

  // PRD Rule #6: Check if any settlement is paid
  const existingSettlements = await db.query.settlements.findMany({
    where: eq(settlements.eventId, eventId),
  });

  if (existingSettlements.some((s) => s.isPaid)) {
    return {
      error:
        "Ada transfer yang sudah berstatus Lunas. Batalkan status lunas terlebih dahulu sebelum menambah pengeluaran baru.",
    };
  }

  // PRD Section 5 Assumption #3: Minimum 2 members required
  const allMembers = await db.query.members.findMany({
    where: eq(members.eventId, eventId),
  });

  if (allMembers.length < 2) {
    return {
      error:
        "Event membutuhkan minimal 2 peserta sebelum pengeluaran dapat dicatat.",
    };
  }

  const rawTitle = formData.get("title");
  const rawAmount = formData.get("amount");
  const rawPayerId = formData.get("paidByMemberId");

  const titleStr = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const amountBigInt =
    typeof rawAmount === "string" ? parseRupiahInput(rawAmount) : BigInt(0);
  const payerIdStr = typeof rawPayerId === "string" ? rawPayerId : "";

  if (!titleStr || titleStr.length > 160) {
    return { error: "Deskripsi pengeluaran wajib diisi (1–160 karakter)." };
  }

  if (amountBigInt <= BigInt(0)) {
    return { error: "Nominal pengeluaran harus berupa bilangan bulat positif rupiah." };
  }

  // Verify payer belongs to this event
  const payer = await db.query.members.findFirst({
    where: and(eq(members.id, payerIdStr), eq(members.eventId, eventId)),
  });

  if (!payer) {
    return { error: "Peserta pembayar tidak ditemukan dalam event ini." };
  }

  // Insert expense
  await db.insert(expenses).values({
    eventId,
    paidByMemberId: payerIdStr,
    title: titleStr,
    amount: amountBigInt,
  });

  // Rebuild settlements atomically
  await rebuildEventSettlements(eventId);

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function updateExpenseAction(
  expenseId: string,
  eventId: string,
  _prevState: ExpenseActionState | null,
  formData: FormData
): Promise<ExpenseActionState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Silakan masuk terlebih dahulu." };
  }

  // Verify event ownership
  const event = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.ownerId, user.id)),
  });

  if (!event) {
    return { error: "Event tidak ditemukan atau Anda tidak memiliki izin." };
  }

  // PRD Rule #6: Block update if any settlement is paid
  const existingSettlements = await db.query.settlements.findMany({
    where: eq(settlements.eventId, eventId),
  });

  if (existingSettlements.some((s) => s.isPaid)) {
    return {
      error:
        "Ada transfer yang sudah berstatus Lunas. Batalkan status lunas terlebih dahulu sebelum mengedit pengeluaran.",
    };
  }

  // Verify expense belongs to this event
  const existingExpense = await db.query.expenses.findFirst({
    where: and(eq(expenses.id, expenseId), eq(expenses.eventId, eventId)),
  });

  if (!existingExpense) {
    return { error: "Pengeluaran tidak ditemukan dalam event ini." };
  }

  const rawTitle = formData.get("title");

  const rawAmount = formData.get("amount");
  const rawPayerId = formData.get("paidByMemberId");

  const titleStr = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const amountBigInt =
    typeof rawAmount === "string" ? parseRupiahInput(rawAmount) : BigInt(0);
  const payerIdStr = typeof rawPayerId === "string" ? rawPayerId : "";

  if (!titleStr || titleStr.length > 160) {
    return { error: "Deskripsi pengeluaran wajib diisi (1–160 karakter)." };
  }

  if (amountBigInt <= BigInt(0)) {
    return { error: "Nominal pengeluaran harus berupa bilangan bulat positif rupiah." };
  }

  const payer = await db.query.members.findFirst({
    where: and(eq(members.id, payerIdStr), eq(members.eventId, eventId)),
  });

  if (!payer) {
    return { error: "Peserta pembayar tidak ditemukan dalam event ini." };
  }

  await db
    .update(expenses)
    .set({
      title: titleStr,
      amount: amountBigInt,
      paidByMemberId: payerIdStr,
      updatedAt: new Date(),
    })
    .where(and(eq(expenses.id, expenseId), eq(expenses.eventId, eventId)));

  await rebuildEventSettlements(eventId);

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function deleteExpenseAction(
  expenseId: string,
  eventId: string
): Promise<ExpenseActionState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Silakan masuk terlebih dahulu." };
  }

  const event = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.ownerId, user.id)),
  });

  if (!event) {
    return { error: "Event tidak ditemukan atau Anda tidak memiliki izin." };
  }

  const existingSettlements = await db.query.settlements.findMany({
    where: eq(settlements.eventId, eventId),
  });

  if (existingSettlements.some((s) => s.isPaid)) {
    return {
      error:
        "Ada transfer yang sudah berstatus Lunas. Batalkan status lunas terlebih dahulu sebelum menghapus pengeluaran.",
    };
  }

  await db
    .delete(expenses)
    .where(and(eq(expenses.id, expenseId), eq(expenses.eventId, eventId)));

  await rebuildEventSettlements(eventId);

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}
