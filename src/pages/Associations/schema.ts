import { z } from "zod"

export const associationItemSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Wymagane"),
  imageUrl: z.string().nullable(),
  link: z.string().min(1, "Wymagane"),
})

export const associationsSchema = z.object({
  config: z.object({
    nameFont: z.string().nullable(),
    nameSize: z.string().nullable(),
  }),
  items: z.array(associationItemSchema),
})

export type AssociationsFormValues = z.infer<typeof associationsSchema>
