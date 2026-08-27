import { z } from "zod"

export const navChildItemSchema = z.object({
  id: z.number().optional(),
  label: z.string().min(1, "Wymagane"),
  href: z.string().min(1, "Wymagane"),
})

export const navItemSchema = z.object({
  id: z.number().optional(),
  label: z.string().min(1, "Wymagane"),
  href: z.string().min(1, "Wymagane"),
  isLocked: z.boolean().optional(),
  children: z.array(navChildItemSchema),
})

export const navbarSchema = z.object({
  items: z.array(navItemSchema),
})

export type NavItemFormValues = z.infer<typeof navItemSchema>
export type NavbarFormValues = z.infer<typeof navbarSchema>
