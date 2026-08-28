import { apiClient } from "@/lib/api-client"
import type { AssociationsData } from "@/types/config"

export interface AssociationsPayload {
  config: {
    nameFont: string | null
    nameSize: string | null
  }
  items: Array<{
    id?: number
    name: string
    imageUrl: string | null
    link: string
  }>
}

export const associationsApi = {
  get: () => apiClient.get<AssociationsData>("/associations"),
  update: (payload: AssociationsPayload) => apiClient.put<AssociationsData>("/associations", payload),
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append("image", file)
    return apiClient.upload<{ url: string }>("/associations/upload-image", formData)
  },
}
