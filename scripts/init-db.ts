import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

export async function initDb() {
  if (!connectionString) {
    console.log("⚠️ No DATABASE_URL found in environment. Skipping database init.");
    return;
  }

  console.log("Connecting to PostgreSQL to initialize schema and extensions...");
  const sql = neon(connectionString);

  try {
    // 1. Initialize pg_trgm extension
    await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`;
    console.log("✅ Extension 'pg_trgm' initialized.");

    // 2. Create tables idempotently
    await sql`
      CREATE TABLE IF NOT EXISTS equivalent_groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sheet_name TEXT NOT NULL,
        default_energy_kcal REAL NOT NULL,
        default_protein_g REAL NOT NULL,
        default_lipids_g REAL NOT NULL,
        default_carbs_g REAL NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS foods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        group_id TEXT NOT NULL REFERENCES equivalent_groups(id) ON DELETE CASCADE,
        suggested_quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        gross_weight_g REAL NOT NULL,
        net_weight_g REAL NOT NULL,
        energy_kcal REAL NOT NULL,
        protein_g REAL NOT NULL,
        lipids_g REAL NOT NULL,
        carbs_g REAL NOT NULL,
        is_custom BOOLEAN NOT NULL DEFAULT false,
        raw_nutrition_facts JSONB
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        target_portions JSONB NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS weekly_schedule (
        id TEXT PRIMARY KEY,
        day_of_week TEXT NOT NULL,
        plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS daily_logs (
        id TEXT PRIMARY KEY,
        log_date TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        food_id TEXT REFERENCES foods(id),
        custom_food_name TEXT,
        grams REAL NOT NULL,
        equivalents_covered JSONB NOT NULL,
        computed_macros JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log("✅ Tables ensured (equivalent_groups, foods, plans, weekly_schedule, daily_logs).");

    // 3. Create indexes idempotently
    await sql`CREATE INDEX IF NOT EXISTS foods_name_trgm_idx ON foods USING gin (name gin_trgm_ops);`;
    await sql`CREATE INDEX IF NOT EXISTS foods_group_idx ON foods (group_id);`;
    await sql`CREATE INDEX IF NOT EXISTS daily_logs_date_idx ON daily_logs (log_date);`;
    await sql`CREATE INDEX IF NOT EXISTS weekly_schedule_day_idx ON weekly_schedule (day_of_week);`;
    console.log("✅ GIN trigram and relational indexes ensured.");

    console.log("🎉 Database initialization completed successfully.");
  } catch (error) {
    console.error("❌ Failed during database initialization:", error);
    process.exit(1);
  }
}

initDb();
