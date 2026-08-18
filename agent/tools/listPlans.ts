import { tool } from "ai";
import { z } from "zod";
import { db } from "../db/client.js";
import { plans, weeklySchedule } from "../db/schema.js";

export const listPlansSchema = z.object({});

export interface RegisteredPlanSummary {
  planName: string;
  meals: string[];
  assignedDays: string[];
  totalPortionsByGroup: Record<string, number>;
}

export const listPlans = tool({
  description: "Lists all registered meal plans in the database, including their names, meals, and weekly schedule bindings.",
  parameters: listPlansSchema,
  execute: async () => {
    try {
      const allRows = await db.select().from(plans);
      const scheduleRows = await db.select().from(weeklySchedule);

      const planMap: Record<string, { meals: Set<string>; portions: Record<string, number> }> = {};

      for (const row of allRows) {
        if (!planMap[row.planName]) {
          planMap[row.planName] = { meals: new Set(), portions: {} };
        }
        planMap[row.planName].meals.add(row.meal);
        planMap[row.planName].portions[row.groupId] =
          (planMap[row.planName].portions[row.groupId] || 0) + row.equivalentes;
      }

      const scheduleMap: Record<string, string[]> = {};
      for (const s of scheduleRows) {
        if (!scheduleMap[s.planName]) scheduleMap[s.planName] = [];
        scheduleMap[s.planName].push(s.dayOfWeek);
      }

      const result: RegisteredPlanSummary[] = Object.entries(planMap).map(([name, data]) => ({
        planName: name,
        meals: Array.from(data.meals),
        assignedDays: scheduleMap[name] || [],
        totalPortionsByGroup: data.portions,
      }));

      return {
        count: result.length,
        plans: result,
      };
    } catch (err: any) {
      return {
        count: 0,
        plans: [],
        error: err?.message || String(err),
      };
    }
  },
});
