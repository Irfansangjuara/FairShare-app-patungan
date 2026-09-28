import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.ts";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "postgresql://localhost:5432/fairshare";

const isLocal =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1") ||
  connectionString.includes("::1");

// Disable prefetch for serverless/Next.js environments, require SSL for cloud.
// `max` is kept small because each serverless instance opens its own pool and
// the upstream database (Neon/Supabase/PgBouncer) enforces a global connection
// cap — a large per-instance pool multiplied by many instances exhausts it.
const client = postgres(connectionString, {
  prepare: false,
  ssl: isLocal ? false : "require",
  max: isLocal ? 10 : 5,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
export type Database = typeof db;
