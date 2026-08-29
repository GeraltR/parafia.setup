import { apiClient } from "@/lib/api-client"
import type { FooterConfig } from "@/types/config"

export interface FooterUpdatePayload {
  officeTitle: string
  officeNote: string
  mapEmbedUrl: string
  mapLink: string
  config: FooterConfig["config"]
  officeHours: Array<{
    id?: number
    day: string
    hoursOn: string
    hoursEnd: string
  }>
}

export const footerApi = {
  get: () => apiClient.get<FooterConfig>("/footer"),
  update: (payload: FooterUpdatePayload) => apiClient.put<FooterConfig>("/footer", payload),
}
