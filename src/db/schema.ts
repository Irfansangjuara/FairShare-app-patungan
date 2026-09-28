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
  phone: varchar("phone", { length: 30 }),
  googleId: text("google_id").unique(),
  name: varchar("name", { length: 120 }).notNull(),
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash"),
  role: varchar("role", { length: 20 }).default("user").notNull(), // 'user' | 'admin'
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
    bankAccount: text("bank_account"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("members_event_name_unique_idx").on(
      table.eventId,
      sql`lower(${table.name})`
    ),
  ]
);

export const savedParticipants = pgTable(
  "saved_participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    bankAccount: text("bank_account"),
    useCount: integer("use_count").default(1).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("saved_participants_user_name_unique_idx").on(
      table.userId,
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
  category: varchar("category", { length: 80 }).default("Umum").notNull(),
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

export const userAiSettings = pgTable("user_ai_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  telegramBotToken: text("telegram_bot_token"),
  telegramBotUsername: varchar("telegram_bot_username", { length: 120 }),
  telegramWebhookSecret: text("telegram_webhook_secret"),
  isBotActive: boolean("is_bot_active").default(false).notNull(),
  telegramChatId: text("telegram_chat_id"),
  aiProvider: varchar("ai_provider", { length: 40 }).default("deepseek").notNull(), // 'deepseek' | 'claude' | 'gemini' | 'opencode_go' | '9router' | 'openrouter'
  aiApiKey: text("ai_api_key"),
  aiModel: varchar("ai_model", { length: 120 }).default("deepseek-chat").notNull(),
  customModelId: varchar("custom_model_id", { length: 120 }),
  voiceResponseMode: varchar("voice_response_mode", { length: 20 }).default("text").notNull(), // 'text' | 'voice' | 'both'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const articles = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  summary: text("summary"),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  status: varchar("status", { length: 20 }).default("draft").notNull(), // 'draft' | 'published'
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  canonicalUrl: text("canonical_url"),
  isNoindex: boolean("is_noindex").default(false).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sitePages = pgTable("site_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 50 }).notNull().unique(), // 'home' | 'about' | 'contact' | 'privacy' | 'terms'
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  isPublished: boolean("is_published").default(true).notNull(),
  navOrder: integer("nav_order").default(0).notNull(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  canonicalUrl: text("canonical_url"),
  isNoindex: boolean("is_noindex").default(false).notNull(),
  ogImage: text("og_image"),
  ogDescription: text("og_description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 50 }).default("global").notNull().unique(),
  siteName: varchar("site_name", { length: 120 }).default("FairShare").notNull(),
  defaultDescription: text("default_description"),
  defaultOgImage: text("default_og_image"),
  titleTemplate: varchar("title_template", { length: 120 }).default("%s | FairShare").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const apiTokens = pgTable("api_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  tokenPrefix: varchar("token_prefix", { length: 16 }).notNull(),
  scopes: text("scopes").array().default(sql`ARRAY['read:campaigns']::text[]`).notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isRevoked: boolean("is_revoked").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  events: many(events),
  sessions: many(sessions),
  savedParticipants: many(savedParticipants),
  aiSettings: one(userAiSettings, {
    fields: [users.id],
    references: [userAiSettings.userId],
  }),
  articles: many(articles),
  apiTokens: many(apiTokens),
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

export const savedParticipantsRelations = relations(savedParticipants, ({ one }) => ({
  user: one(users, {
    fields: [savedParticipants.userId],
    references: [users.id],
  }),
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

export const userAiSettingsRelations = relations(userAiSettings, ({ one }) => ({
  user: one(users, {
    fields: [userAiSettings.userId],
    references: [users.id],
  }),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
}));

export const apiTokensRelations = relations(apiTokens, ({ one }) => ({
  user: one(users, {
    fields: [apiTokens.userId],
    references: [users.id],
  }),
}));
