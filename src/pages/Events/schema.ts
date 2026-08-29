import { z } from "zod"

export const eventSchema = z.object({
  date: z.string().min(1, "Wymagane"),
  time: z.string().regex(/^\d{1,2}:\d{2}$/, "Format: GG:MM"),
  title: z.string().min(1, "Wymagane"),
  description: z.string().min(1, "Wymagane"),
  body: z.string(),
  authorId: z.number(),
})

export type EventFormValues = z.infer<typeof eventSchema>
