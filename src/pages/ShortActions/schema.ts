import { z } from "zod"

export const shortActionItemSchema = z.object({
  id: z.number(),
  icon: z.string().nullable(),
  iconUrl: z.string().nullable(),
  title: z.string().min(1, "Wymagane"),
  description: z.string().min(1, "Wymagane"),
  href: z.string().min(1, "Wymagane"),
  external: z.boolean(),
})

export const shortActionsSchema = z.object({
  config: z.object({
    titleFont: z.string().nullable(),
    titleSize: z.string().nullable(),
    titleColor: z.string().nullable(),
    subtitleFont: z.string().nullable(),
    subtitleSize: z.string().nullable(),
    subtitleColor: z.string().nullable(),
    bgColor: z.string().nullable(),
    bgColorHover: z.string().nullable(),
  }),
  items: z.array(shortActionItemSchema).length(6),
})

export type ShortActionsFormValues = z.infer<typeof shortActionsSchema>

export const DEFAULT_ICONS = ["mass", "sacraments", "announcements", "office", "media", "contact"] as const
