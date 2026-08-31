import { apiClient } from "@/lib/api-client"
import type { InfoItem } from "@/types/config"

export interface InfoItemPayload {
  validFrom: string
  validTo: string
  title: string
  shortInfo: string
  description: string
  image: string
  progressValue: number
  progressDescription: string
  information: string | null
  authorId: number
}

export const informacjeApi = {
  listManage: () => apiClient.get<InfoItem[]>("/informacje/manage"),
  create: (payload: InfoItemPayload) => apiClient.post<InfoItem>("/informacje", payload),
  update: (id: number, payload: InfoItemPayload) =>
    apiClient.put<InfoItem>(`/informacje/${id}`, payload),
  remove: (id: number) => apiClient.del<void>(`/informacje/${id}`),
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append("image", file)
    return apiClient.upload<{ url: string }>("/informacje/upload-image", formData)
  },
}
