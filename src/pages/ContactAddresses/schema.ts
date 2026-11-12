import { z } from "zod"

export const NETWORK_KEYS = [
  "facebook",
  "youtube",
  "x",
  "instagram",
  "tiktok",
  "pinterest",
  "linkedin",
] as const

export type NetworkKey = (typeof NETWORK_KEYS)[number]

export const NETWORK_LABELS: Record<NetworkKey, string> = {
  facebook: "Facebook",
  youtube: "YouTube",
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
  pinterest: "Pinterest",
  linkedin: "LinkedIn",
}

export const contactAddressSchema = z
  .object({
  street: z.string().min(1, "Wymagane"),
  city: z.string().min(1, "Wymagane"),
  postCode: z.string().regex(/^\d{2}-\d{3}$/, "Format: NN-NNN"),
  phone: z.string().min(1, "Wymagane"),
  nip: z.string().nullable(),
  bankAccountNumber: z.string().nullable(),
  bankName: z.string().nullable(),
  additionalBankIsActive: z.boolean(),
  additionalBankTitle: z.string().nullable(),
  additionalBankNumber: z.string().nullable(),
  additionalBankName: z.string().nullable(),
  social: z
    .array(
      z.object({
        network: z.enum(NETWORK_KEYS),
        link: z.string(),
        visibility: z.boolean(),
      })
    )
    .length(NETWORK_KEYS.length),
  })
  .superRefine((values, ctx) => {
    if (!values.additionalBankIsActive) return
    if (!values.additionalBankTitle) {
      ctx.addIssue({ code: "custom", path: ["additionalBankTitle"], message: "Wymagane" })
    }
    if (!values.additionalBankNumber) {
      ctx.addIssue({ code: "custom", path: ["additionalBankNumber"], message: "Wymagane" })
    }
  })

export type ContactAddressFormValues = z.infer<typeof contactAddressSchema>
