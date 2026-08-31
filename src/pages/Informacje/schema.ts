import { z } from "zod"

export const infoItemSchema = z
  .object({
    validFrom: z.string().min(1, "Wymagane"),
    validTo: z.string().min(1, "Wymagane"),
    title: z.string().min(1, "Wymagane"),
    shortInfo: z.string().min(1, "Wymagane"),
    description: z.string().min(1, "Wymagane"),
    image: z.string().min(1, "Wgraj obraz"),
    progressValue: z.number().min(0).max(100),
    progressDescription: z.string().min(1, "Wymagane"),
    information: z.string().nullable(),
    bannerText: z.string().nullable(),
    bannerFont: z.string().nullable(),
    bannerTextColor: z.string().nullable(),
    bannerBgColor: z.string().nullable(),
    bannerDurationSeconds: z.number().min(0).max(300),
    authorId: z.number(),
  })
  .refine((data) => data.validTo >= data.validFrom, {
    message: "Data 'do' nie może być wcześniejsza niż data 'od'",
    path: ["validTo"],
  })

export type InfoItemFormValues = z.infer<typeof infoItemSchema>
