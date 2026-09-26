import {
  pgTable,
  uuid,
  text,
  varchar,
  bigint,
  boolean,
  timestamp,
  date,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  googleId: text("google_id").unique(),
  name: varchar("name", { length: 120 }).notNull(),
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 120 }).notNull(),
  location: varchar("location", { length: 160 }),
  eventDate: date("event_date"),
  shareToken: text("share_token").unique(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const members = pgTable(
  "members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("members_event_name_unique_idx").on(
      table.eventId,
      sql`lower(${table.name})`
    ),
  ]
);

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  paidByMemberId: uuid("paid_by_member_id")
    .notNull()
    .references(() => members.id, { onDelete: "restrict" }),
  title: varchar("title", { length: 160 }).notNull(),
  amount: bigint("amount", { mode: "bigint" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const settlements = pgTable("settlements", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  fromMemberId: uuid("from_member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  toMemberId: uuid("to_member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  amount: bigint("amount", { mode: "bigint" }).notNull(),
  isPaid: boolean("is_paid").default(false).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  calculationVersion: integer("calculation_version").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  sessions: many(sessions),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  owner: one(users, {
    fields: [events.ownerId],
    references: [users.id],
  }),
  members: many(members),
  expenses: many(expenses),
  settlements: many(settlements),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  event: one(events, {
    fields: [members.eventId],
    references: [events.id],
  }),
  expensesPaid: many(expenses),
  settlementsFrom: many(settlements, { relationName: "fromMember" }),
  settlementsTo: many(settlements, { relationName: "toMember" }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  event: one(events, {
    fields: [expenses.eventId],
    references: [events.id],
  }),
  paidByMember: one(members, {
    fields: [expenses.paidByMemberId],
    references: [members.id],
  }),
}));

export const settlementsRelations = relations(settlements, ({ one }) => ({
  event: one(events, {
    fields: [settlements.eventId],
    references: [events.id],
  }),
  fromMember: one(members, {
    fields: [settlements.fromMemberId],
    references: [members.id],
    relationName: "fromMember",
  }),
  toMember: one(members, {
    fields: [settlements.toMemberId],
    references: [members.id],
    relationName: "toMember",
  }),
}));
