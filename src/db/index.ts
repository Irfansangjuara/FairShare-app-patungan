import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgresql://localhost:5432/fairshare";

// Disable prefetch for serverless/Next.js environments
const client = postgres(connectionString, {
  prepare: false,
  ssl: connectionString.includes("sslmode=require") ? "require" : undefined,
});

export const db = drizzle(client, { schema });
export type Database = typeof db;
