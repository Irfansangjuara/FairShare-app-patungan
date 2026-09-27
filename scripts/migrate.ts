import { ensureDatabaseSchema } from "../src/db/migrate.ts";

async function main() {
  console.log("Running database migrations and seeders...");
  try {
    await ensureDatabaseSchema();
    console.log("Database migrations completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
