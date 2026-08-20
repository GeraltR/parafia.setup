import { apiClient } from "@/lib/api-client"

export interface FontVariant {
  url: string
  weight: number
  style: "normal" | "italic"
}

export interface FontFamily {
  family: string
  variants: FontVariant[]
}

export const fontsApi = {
  list: () => apiClient.get<FontFamily[]>("/fonts"),
}
