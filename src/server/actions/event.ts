"use server";

import { db } from "../../db";
import { events } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionUser, generateShareToken } from "../../lib/auth";
import { eventSchema } from "../../lib/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface EventActionState {
  error?: string;
  success?: boolean;
}

export async function createEventAction(
  _prevState: EventActionState | null,
  formData: FormData
): Promise<EventActionState> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const rawData = {
    title: formData.get("title"),
    location: formData.get("location") || null,
    eventDate: formData.get("eventDate") || null,
  };

  const parsed = eventSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const shareToken = generateShareToken();

  const [newEvent] = await db
    .insert(events)
    .values({
      ownerId: user.id,
      title: parsed.data.title,
      location: parsed.data.location || null,
      eventDate: parsed.data.eventDate || null,
      shareToken,
    })
    .returning({ id: events.id });

  redirect(`/events/${newEvent.id}`);
}

export async function updateEventAction(
  eventId: string,
  _prevState: EventActionState | null,
  formData: FormData
): Promise<EventActionState> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const rawData = {
    title: formData.get("title"),
    location: formData.get("location") || null,
    eventDate: formData.get("eventDate") || null,
  };

  const parsed = eventSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const updated = await db
    .update(events)
    .set({
      title: parsed.data.title,
      location: parsed.data.location || null,
      eventDate: parsed.data.eventDate || null,
      updatedAt: new Date(),
    })
    .where(and(eq(events.id, eventId), eq(events.ownerId, user.id)))
    .returning({ id: events.id });

  if (updated.length === 0) {
    return { error: "Event tidak ditemukan atau Anda tidak memiliki izin." };
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleArchiveEventAction(eventId: string) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const existing = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.ownerId, user.id)),
  });

  if (!existing) {
    throw new Error("Event tidak ditemukan.");
  }

  const newArchivedAt = existing.archivedAt ? null : new Date();

  await db
    .update(events)
    .set({
      archivedAt: newArchivedAt,
      updatedAt: new Date(),
    })
    .where(eq(events.id, eventId));

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
}

export async function deleteEventAction(eventId: string) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  await db
    .delete(events)
    .where(and(eq(events.id, eventId), eq(events.ownerId, user.id)));

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function regenerateShareTokenAction(eventId: string) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const newToken = generateShareToken();

  await db
    .update(events)
    .set({
      shareToken: newToken,
      updatedAt: new Date(),
    })
    .where(and(eq(events.id, eventId), eq(events.ownerId, user.id)));

  revalidatePath(`/events/${eventId}`);
  return newToken;
}
