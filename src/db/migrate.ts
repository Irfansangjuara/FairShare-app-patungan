import { db } from "./index";
import { sql } from "drizzle-orm";
import { hashPassword } from "../lib/auth";

let isSchemaEnsured = false;

export async function ensureDatabaseSchema(): Promise<void> {
  if (isSchemaEnsured) {
    return;
  }

  try {
    // 1. Ensure all tables and columns exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text NOT NULL UNIQUE,
        google_id text UNIQUE,
        name varchar(120) NOT NULL,
        avatar_url text,
        password_hash text,
        created_at timestamptz DEFAULT now() NOT NULL
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id text;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;

      CREATE TABLE IF NOT EXISTS sessions (
        id text PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at timestamptz NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title varchar(120) NOT NULL,
        location varchar(160),
        event_date date,
        share_token text UNIQUE,
        archived_at timestamptz,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS members (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        name varchar(80) NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        paid_by_member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
        title varchar(160) NOT NULL,
        amount bigint NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settlements (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        from_member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        to_member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        amount bigint NOT NULL,
        is_paid boolean DEFAULT false NOT NULL,
        paid_at timestamptz,
        calculation_version integer DEFAULT 1 NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );
    `);

    // 2. Ensure admin account exists
    const adminPasswordHash = await hashPassword("admin#123");
    await db.execute(sql`
      INSERT INTO users (id, email, name, password_hash)
      VALUES (gen_random_uuid(), 'admin@admin.com', 'Administrator', ${adminPasswordHash})
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = ${adminPasswordHash};
    `);

    isSchemaEnsured = true;
    console.log("✓ Database schema & admin user verified successfully");
  } catch (err) {
    console.error("Failed to auto-migrate database schema:", err);
    throw err;
  }
}
