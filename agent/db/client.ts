import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL || "";

// In test / build environments where DATABASE_URL is not set, provide a dummy proxy client
export const sql = connectionString ? neon(connectionString) : (() => Promise.resolve([])) as unknown as ReturnType<typeof neon>;
export const db = connectionString ? drizzle(sql, { schema }) : null as unknown as ReturnType<typeof drizzle<typeof schema>>;
