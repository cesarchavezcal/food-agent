import { pgTable, text, real, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// 1. Equivalent Groups (Reference standard SMAE data)
export const equivalentGroups = pgTable("equivalent_groups", {
  id: text("id").primaryKey(), // e.g. "verduras", "cereales_sin_grasa", "aoa_muy_bajo_grasa"
  name: text("name").notNull(),
  subgroup: text("subgroup"),
  kcal: real("kcal").notNull(),
  proteinG: real("protein_g").notNull(),
  fatG: real("fat_g").notNull(),
  choG: real("cho_g").notNull(),
});

// 2. Food Catalog (Seeded from Excel + user custom additions)
export const foods = pgTable(
  "foods",
  {
    id: text("id").primaryKey(), // uuid or slug
    name: text("name").notNull(),
    groupId: text("group_id").references(() => equivalentGroups.id),
    gramsPerEquivalent: real("grams_per_equivalent").notNull(),
    suggestedQuantity: real("suggested_quantity"),
    suggestedUnit: text("suggested_unit"),
    kcal100g: real("kcal_100g").default(0),
    protein100g: real("protein_100g").default(0),
    fat100g: real("fat_100g").default(0),
    cho100g: real("cho_100g").default(0),
    source: text("source").notNull().default("excel"), // "excel" | "user"
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("foods_name_trgm_idx").using("gin", sql`${table.name} gin_trgm_ops`),
    index("foods_group_idx").on(table.groupId),
  ]
);

// 3. Meal Plans (Portions per group for specific routines)
export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  planName: text("plan_name").notNull(), // e.g. "leg day", "rest day", "cardio"
  meal: text("meal").notNull(), // "desayuno" | "almuerzo" | "comida" | "colacion_1" | "colacion_2" | "cena"
  groupId: text("group_id")
    .notNull()
    .references(() => equivalentGroups.id),
  equivalentes: real("equivalentes").notNull(),
});

// 4. Weekly Schedule (Mapping calendar days to default plan names)
export const weeklySchedule = pgTable("weekly_schedule", {
  id: text("id").primaryKey(),
  dayOfWeek: text("day_of_week").notNull().unique(), // "monday", "tuesday", ..., "sunday"
  planName: text("plan_name").notNull(),
});

// 5. Daily Intake Logs (Actual food consumed)
export const dailyLogs = pgTable(
  "daily_logs",
  {
    id: text("id").primaryKey(),
    logDate: text("log_date").notNull(), // "YYYY-MM-DD"
    mealType: text("meal_type").notNull(), // "desayuno", "almuerzo", "comida", etc.
    foodId: text("food_id").references(() => foods.id),
    foodName: text("food_name").notNull(),
    grams: real("grams").notNull(),
    computedEquivalents: jsonb("computed_equivalents").notNull(), // { [groupId]: number }
    computedMacros: jsonb("computed_macros").notNull(), // { kcal, protein, fat, cho }
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("daily_logs_date_idx").on(table.logDate),
    index("daily_logs_date_meal_idx").on(table.logDate, table.mealType),
  ]
);

export type EquivalentGroup = typeof equivalentGroups.$inferSelect;
export type Food = typeof foods.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type WeeklySchedule = typeof weeklySchedule.$inferSelect;
export type DailyLog = typeof dailyLogs.$inferSelect;
