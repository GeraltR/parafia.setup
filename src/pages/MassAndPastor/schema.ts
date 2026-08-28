import { z } from "zod"

export const massTimeSchema = z.object({
  id: z.number().optional(),
  label: z.string().min(1, "Wymagane"),
  hours: z.string().min(1, "Wymagane"),
  note: z.string().nullable(),
})

export const pastorSchema = z.object({
  id: z.number().optional(),
  position: z.string().min(1, "Wymagane"),
  fullName: z.string().min(1, "Wymagane"),
  photoUrl: z.string().nullable(),
  duties: z.string(),
})

export const massAndPastorSchema = z.object({
  config: z.object({
    positionFont: z.string().nullable(),
    positionSize: z.string().nullable(),
    positionColor: z.string().nullable(),
    nameFont: z.string().nullable(),
    nameSize: z.string().nullable(),
    nameColor: z.string().nullable(),
  }),
  massTimes: z.array(massTimeSchema),
  pastors: z.array(pastorSchema),
})

export type MassAndPastorFormValues = z.infer<typeof massAndPastorSchema>
