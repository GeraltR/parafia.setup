import { z } from "zod"

export const officeHourSchema = z.object({
  id: z.number().optional(),
  day: z.string().min(1, "Wymagane"),
  hoursOn: z.string().regex(/^\d{1,2}:\d{2}$/, "Format: GG:MM"),
  hoursEnd: z.string().regex(/^\d{1,2}:\d{2}$/, "Format: GG:MM"),
})

export const footerSchema = z.object({
  officeTitle: z.string().min(1, "Wymagane"),
  officeNote: z.string(),
  mapEmbedUrl: z.string(),
  mapLink: z.string(),
  config: z.object({
    bgColor: z.string().nullable(),
    titleFont: z.string().nullable(),
    titleSize: z.string().nullable(),
    titleColor: z.string().nullable(),
  }),
  officeHours: z.array(officeHourSchema),
})

export type FooterFormValues = z.infer<typeof footerSchema>
