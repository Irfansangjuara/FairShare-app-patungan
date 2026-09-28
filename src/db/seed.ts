import { db } from "./index";
import { users, events, members, expenses, settlements } from "./schema";
import { hashPassword, generateShareToken } from "../lib/auth";
import { calculateSplitAndSettlements } from "../lib/settlement";
import { eq } from "drizzle-orm";

export async function seedDemoData() {
  console.log("🌱 Seeding FairShare demo data...");

  // 1. Check or create demo user
  const demoEmail = "demo@fairshare.id";
  let user = await db.query.users.findFirst({
    where: eq(users.email, demoEmail),
  });

  if (!user) {
    const passwordHash = await hashPassword("password123");
    const [createdUser] = await db
      .insert(users)
      .values({
        email: demoEmail,
        name: "Irfan Sangjuara",
        passwordHash,
      })
      .returning();
    user = createdUser;
    console.log("✓ Created demo user:", user.email);
  }

  // 1b. Administrator bootstrap is environment-driven (see
  //     ensureDatabaseSchema). The demo seeder must never create a
  //     well-known administrator password.

  // 2. Check if benchmark event exists
  const existingEvent = await db.query.events.findFirst({
    where: eq(events.title, "Liburan Pantai Indah Jogja 🏖️"),
  });

  if (existingEvent) {
    console.log("✓ Benchmark event already exists:", existingEvent.id);
    return existingEvent.id;
  }

  // 3. Create benchmark event
  const [newEvent] = await db
    .insert(events)
    .values({
      ownerId: user.id,
      title: "Liburan Pantai Indah Jogja 🏖️",
      location: "Yogyakarta",
      eventDate: "2026-09-26",
      shareToken: generateShareToken(),
    })
    .returning();

  // 4. Create 4 members in deterministic order
  const [andri] = await db
    .insert(members)
    .values({ eventId: newEvent.id, name: "Andri" })
    .returning();

  const [tedy] = await db
    .insert(members)
    .values({ eventId: newEvent.id, name: "Tedy" })
    .returning();

  const [irfan] = await db
    .insert(members)
    .values({ eventId: newEvent.id, name: "Irfan" })
    .returning();

  const [rion] = await db
    .insert(members)
    .values({ eventId: newEvent.id, name: "Rion" })
    .returning();

  // 5. Create expenses from PRD Section 8
  await db.insert(expenses).values([
    {
      eventId: newEvent.id,
      paidByMemberId: andri.id,
      title: "Penginapan Villa 2 Malam",
      amount: BigInt(385000),
    },
    {
      eventId: newEvent.id,
      paidByMemberId: tedy.id,
      title: "Makan Seafood Pantai Parangtritis",
      amount: BigInt(284000),
    },
    {
      eventId: newEvent.id,
      paidByMemberId: irfan.id,
      title: "Sewa Mobil Innova & Bensin",
      amount: BigInt(200000),
    },
    {
      eventId: newEvent.id,
      paidByMemberId: rion.id,
      title: "Kopi Klotok & Cemilan Perjalanan",
      amount: BigInt(65000),
    },
  ]);

  // 6. Compute & insert settlements
  const allMembers = [andri, tedy, irfan, rion];
  const allExpenses = [
    { id: "1", paidByMemberId: andri.id, amount: BigInt(385000), title: "Penginapan" },
    { id: "2", paidByMemberId: tedy.id, amount: BigInt(284000), title: "Makan" },
    { id: "3", paidByMemberId: irfan.id, amount: BigInt(200000), title: "Mobil" },
    { id: "4", paidByMemberId: rion.id, amount: BigInt(65000), title: "Kopi" },
  ];

  const { settlements: recs } = calculateSplitAndSettlements(
    allMembers.map((m) => ({ id: m.id, name: m.name, createdAt: m.createdAt })),
    allExpenses
  );

  for (let i = 0; i < recs.length; i++) {
    const r = recs[i];
    // Mark first transfer as paid for demonstration
    const isPaid = i === 0;
    await db.insert(settlements).values({
      eventId: newEvent.id,
      fromMemberId: r.fromMemberId,
      toMemberId: r.toMemberId,
      amount: r.amount,
      isPaid,
      paidAt: isPaid ? new Date() : null,
      calculationVersion: 1,
    });
  }

  console.log("✓ Successfully seeded benchmark event:", newEvent.id);
  return newEvent.id;
}

if (process.argv[1]?.endsWith("seed.ts")) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
