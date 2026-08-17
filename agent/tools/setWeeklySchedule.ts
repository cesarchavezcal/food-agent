import { tool } from "ai";
import { z } from "zod";
import { db } from "../db/client.js";
import { weeklySchedule } from "../db/schema.js";

const DAY_MAP: Record<string, string> = {
  domingo: "sunday",
  sunday: "sunday",
  sun: "sunday",
  lunes: "monday",
  monday: "monday",
  mon: "monday",
  martes: "tuesday",
  tuesday: "tuesday",
  tue: "tuesday",
  miercoles: "wednesday",
  miércoles: "wednesday",
  wednesday: "wednesday",
  wed: "wednesday",
  jueves: "thursday",
  thursday: "thursday",
  thu: "thursday",
  viernes: "friday",
  friday: "friday",
  fri: "friday",
  sabado: "saturday",
  sábado: "saturday",
  saturday: "saturday",
  sat: "saturday",
};

export const setWeeklyScheduleSchema = z.object({
  schedule: z
    .record(z.string(), z.string())
    .describe(
      "Map of day names to plan names (e.g. { monday: 'ALTA DEMANDA', tuesday: 'ALTA DEMANDA', saturday: 'MEDIA', sunday: 'DESCANSO' })"
    ),
});

export const setWeeklySchedule = tool({
  description:
    "Binds days of the week (Monday through Sunday) to specific nutrition plans in the database schedule.",
  parameters: setWeeklyScheduleSchema,
  execute: async ({ schedule }) => {
    try {
      let assignedCount = 0;
      const assignments: Array<{ dayOfWeek: string; planName: string }> = [];

      for (const [dayKey, planName] of Object.entries(schedule)) {
        const normalizedDay = DAY_MAP[dayKey.toLowerCase().trim()];
        if (!normalizedDay) continue;

        const normalizedPlan = planName.trim();

        if (db) {
          await db
            .insert(weeklySchedule)
            .values({
              id: `sched_${normalizedDay}`,
              dayOfWeek: normalizedDay,
              planName: normalizedPlan,
            })
            .onConflictDoUpdate({
              target: weeklySchedule.dayOfWeek,
              set: {
                planName: normalizedPlan,
              },
            });
        }

        assignedCount++;
        assignments.push({
          dayOfWeek: normalizedDay,
          planName: normalizedPlan,
        });
      }

      return {
        success: true,
        assignedDays: assignedCount,
        assignments,
        message: `Weekly schedule updated with ${assignedCount} days mapped.`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
