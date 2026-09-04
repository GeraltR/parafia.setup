import { apiClient } from "@/lib/api-client"

export interface MediaItem {
  id: number
  url: string
  originalName: string | null
  mimeType: string | null
  size: number | null
  createdAt: string | null
  author?: { id: number; name: string } | null
}

export const mediaApi = {
  list: () => apiClient.get<MediaItem[]>("/media"),
  remove: (id: number) => apiClient.del<void>(`/media/${id}`),
}
