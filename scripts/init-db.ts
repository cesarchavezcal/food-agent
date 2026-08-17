import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function initDb() {
  if (!connectionString) {
    console.log("⚠️ No DATABASE_URL found in environment. Skipping database init.");
    return;
  }

  console.log("Connecting to PostgreSQL to initialize extensions and indexes...");
  const sql = neon(connectionString);

  try {
    // 1. Initialize pg_trgm extension
    await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`;
    console.log("✅ Extension 'pg_trgm' initialized successfully.");

    // 2. Ensure indexes exist on foods table if table exists
    await sql`CREATE INDEX IF NOT EXISTS foods_name_trgm_idx ON foods USING gin (name gin_trgm_ops);`;
    await sql`CREATE INDEX IF NOT EXISTS foods_group_idx ON foods (group_id);`;
    await sql`CREATE INDEX IF NOT EXISTS daily_logs_date_idx ON daily_logs (log_date);`;
    console.log("✅ Custom GIN trigram and relational indexes ensured.");
  } catch (error) {
    console.error("❌ Failed during database initialization:", error);
    process.exit(1);
  }
}

initDb();
