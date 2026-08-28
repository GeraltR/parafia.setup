import { apiClient } from "@/lib/api-client"
import type { ShortActionsData } from "@/types/config"

export interface ShortActionItemPayload {
  id: number
  icon: string | null
  iconUrl: string | null
  title: string
  description: string
  href: string
  external: boolean
}

export interface ShortActionsPayload {
  config: {
    titleFont: string | null
    titleSize: string | null
    titleColor: string | null
    subtitleFont: string | null
    subtitleSize: string | null
    subtitleColor: string | null
    bgColor: string | null
    bgColorHover: string | null
  }
  items: ShortActionItemPayload[]
}

export const shortActionsApi = {
  get: () => apiClient.get<ShortActionsData>("/short-actions"),
  update: (payload: ShortActionsPayload) => apiClient.put<ShortActionsData>("/short-actions", payload),
  uploadIcon: (file: File) => {
    const formData = new FormData()
    formData.append("icon", file)
    return apiClient.upload<{ url: string }>("/short-actions/upload-icon", formData)
  },
}
