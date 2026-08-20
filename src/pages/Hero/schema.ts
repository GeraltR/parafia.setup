import { z } from "zod"

import { iconSchema, vAlignSchema } from "@/lib/fieldOptions"

export const heroButtonSchema = z.object({
  id: z.number().optional(),
  label: z.string().min(1, "Wymagane"),
  href: z.string().min(1, "Wymagane"),
  icon: iconSchema,
  external: z.boolean().optional(),
  textColor: z.string().nullable(),
  textColorHover: z.string().nullable(),
  bgColor: z.string().nullable(),
  bgColorHover: z.string().nullable(),
})

export const heroSchema = z.object({
  title: z.string(),
  titleWidth: z.number().min(1).max(12),
  titleFont: z.string(),
  titleVAlign: vAlignSchema,
  titleColor: z.string().nullable(),
  subtitle: z.string(),
  subtitleWidth: z.number().min(1).max(12),
  subtitleFont: z.string(),
  subtitleVAlign: vAlignSchema,
  subtitleColor: z.string().nullable(),
  keynote: z.string(),
  keynoteWidth: z.number().min(1).max(12),
  keynoteFont: z.string(),
  keynoteVAlign: vAlignSchema,
  backgroundImage: z.string().min(1, "Wgraj obraz tła"),
  buttons: z.array(heroButtonSchema),
})

export type HeroFormValues = z.infer<typeof heroSchema>
