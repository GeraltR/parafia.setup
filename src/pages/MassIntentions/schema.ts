import { z } from "zod"

export const intentionSchema = z.object({
  date: z.string().min(1, "Wymagane"),
  time: z.string().regex(/^\d{1,2}:\d{2}$/, "Format: GG:MM"),
  intention: z.string().min(1, "Wymagane"),
  isHoliday: z.boolean(),
  dayDescription: z.string().nullable(),
  authorId: z.number().nullable(),
})

export type IntentionFormValues = z.infer<typeof intentionSchema>

export const configSchema = z.object({
  holidayDescribedColor: z.string().min(1),
  holidayPlainColor: z.string().min(1),
  weekdayColor: z.string().min(1),
})

export type ConfigFormValues = z.infer<typeof configSchema>
