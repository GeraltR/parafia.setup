import { z } from "zod"

export const newsSchema = z.object({
  date: z.string().min(1, "Wymagane"),
  title: z.string().min(1, "Wymagane"),
  excerpt: z.string().min(1, "Wymagane"),
  image: z.string().nullable(),
  body: z.string(),
  showImageOnFullContent: z.boolean(),
  authorId: z.number(),
})

export type NewsFormValues = z.infer<typeof newsSchema>
