"use server";

import { db } from "../../db";
import { members, events, expenses, savedParticipants } from "../../db/schema";
import { eq, and, sql, desc, ilike } from "drizzle-orm";
import { getSessionUser } from "../../lib/auth";
import { memberSchema } from "../../lib/validation";
import { revalidatePath } from "next/cache";

export interface MemberActionState {
  error?: string;
  success?: boolean;
}

export interface SavedParticipantItem {
  id: string;
  name: string;
  bankAccount: string | null;
  useCount: number;
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
  const rawBankAccount = formData.get("bankAccount");

  const parsed = memberSchema.safeParse({
    name: rawName,
    bankAccount: typeof rawBankAccount === "string" ? rawBankAccount.trim() : null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const normalizedName = parsed.data.name.trim();
  const bankAccountStr = parsed.data.bankAccount?.trim() || null;

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
    bankAccount: bankAccountStr,
  });

  // Track in saved_participants for future smart suggestions (isolated per user)
  try {
    const existingSaved = await db.query.savedParticipants.findFirst({
      where: and(
        eq(savedParticipants.userId, user.id),
        sql`lower(${savedParticipants.name}) = lower(${normalizedName})`
      ),
    });

    if (existingSaved) {
      await db
        .update(savedParticipants)
        .set({
          bankAccount: bankAccountStr || existingSaved.bankAccount,
          useCount: existingSaved.useCount + 1,
          lastUsedAt: new Date(),
        })
        .where(eq(savedParticipants.id, existingSaved.id));
    } else {
      await db.insert(savedParticipants).values({
        userId: user.id,
        name: normalizedName,
        bankAccount: bankAccountStr,
        useCount: 1,
        lastUsedAt: new Date(),
      });
    }
  } catch (err) {
    console.error("Non-fatal: Failed to save participant suggestion history:", err);
  }

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
  const rawBankAccount = formData.get("bankAccount");

  const parsed = memberSchema.safeParse({
    name: rawName,
    bankAccount: typeof rawBankAccount === "string" ? rawBankAccount.trim() : null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const normalizedName = parsed.data.name.trim();
  const bankAccountStr = parsed.data.bankAccount?.trim() || null;

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
    .set({
      name: normalizedName,
      bankAccount: bankAccountStr,
    })
    .where(and(eq(members.id, memberId), eq(members.eventId, eventId)));

  // Update in saved_participants as well
  try {
    if (bankAccountStr) {
      const existingSaved = await db.query.savedParticipants.findFirst({
        where: and(
          eq(savedParticipants.userId, user.id),
          sql`lower(${savedParticipants.name}) = lower(${normalizedName})`
        ),
      });

      if (existingSaved) {
        await db
          .update(savedParticipants)
          .set({
            bankAccount: bankAccountStr,
            lastUsedAt: new Date(),
          })
          .where(eq(savedParticipants.id, existingSaved.id));
      } else {
        await db.insert(savedParticipants).values({
          userId: user.id,
          name: normalizedName,
          bankAccount: bankAccountStr,
          useCount: 1,
          lastUsedAt: new Date(),
        });
      }
    }
  } catch (err) {
    console.error("Non-fatal: Failed to update participant suggestion history:", err);
  }

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

export async function getSavedParticipantsAction(
  query?: string
): Promise<SavedParticipantItem[]> {
  const user = await getSessionUser();
  if (!user) {
    return [];
  }

  try {
    const list = await db.query.savedParticipants.findMany({
      where: query && query.trim()
        ? and(
            eq(savedParticipants.userId, user.id),
            ilike(savedParticipants.name, `%${query.trim()}%`)
          )
        : eq(savedParticipants.userId, user.id),
      orderBy: [desc(savedParticipants.useCount), desc(savedParticipants.lastUsedAt)],
      limit: 15,
    });

    return list.map((item) => ({
      id: item.id,
      name: item.name,
      bankAccount: item.bankAccount,
      useCount: item.useCount,
    }));
  } catch (err) {
    console.error("Error fetching saved participants:", err);
    return [];
  }
}
