"use server";

import { db } from "../../db";
import { members, events, expenses } from "../../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSessionUser } from "../../lib/auth";
import { memberSchema } from "../../lib/validation";
import { revalidatePath } from "next/cache";

export interface MemberActionState {
  error?: string;
  success?: boolean;
}

export async function addMemberAction(
  eventId: string,
  _prevState: MemberActionState | null,
  formData: FormData
): Promise<MemberActionState> {
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

  // PRD Rule #4: Cannot add members if expenses already exist
  const existingExpenses = await db.query.expenses.findMany({
    where: eq(expenses.eventId, eventId),
  });

  if (existingExpenses.length > 0) {
    return {
      error:
        "Peserta tidak dapat ditambah setelah pengeluaran dicatat (Aturan MVP: menjaga konsistensi jatah dan riwayat pelunasan).",
    };
  }

  const rawName = formData.get("name");
  const parsed = memberSchema.safeParse({ name: rawName });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const normalizedName = parsed.data.name.trim();

  // Check duplicate name in this event (case-insensitive)
  const duplicate = await db.query.members.findFirst({
    where: and(
      eq(members.eventId, eventId),
      sql`lower(${members.name}) = lower(${normalizedName})`
    ),
  });

  if (duplicate) {
    return { error: `Peserta dengan nama "${normalizedName}" sudah ada dalam event ini.` };
  }

  await db.insert(members).values({
    eventId,
    name: normalizedName,
  });

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function updateMemberAction(
  memberId: string,
  eventId: string,
  _prevState: MemberActionState | null,
  formData: FormData
): Promise<MemberActionState> {
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

  const rawName = formData.get("name");
  const parsed = memberSchema.safeParse({ name: rawName });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const normalizedName = parsed.data.name.trim();

  // Check duplicate excluding self
  const duplicate = await db.query.members.findFirst({
    where: and(
      eq(members.eventId, eventId),
      sql`lower(${members.name}) = lower(${normalizedName})`,
      sql`${members.id} != ${memberId}`
    ),
  });

  if (duplicate) {
    return { error: `Peserta dengan nama "${normalizedName}" sudah ada dalam event ini.` };
  }

  await db
    .update(members)
    .set({ name: normalizedName })
    .where(and(eq(members.id, memberId), eq(members.eventId, eventId)));

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function deleteMemberAction(
  memberId: string,
  eventId: string
): Promise<MemberActionState> {
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

  // PRD Rule #4: Cannot delete members if expenses already exist
  const existingExpenses = await db.query.expenses.findMany({
    where: eq(expenses.eventId, eventId),
  });

  if (existingExpenses.length > 0) {
    return {
      error:
        "Peserta tidak dapat dihapus setelah pengeluaran dicatat (Aturan MVP: menjaga integritas perhitungan).",
    };
  }

  await db
    .delete(members)
    .where(and(eq(members.id, memberId), eq(members.eventId, eventId)));

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}
