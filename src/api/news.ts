import { apiClient } from "@/lib/api-client"
import type { NewsItem } from "@/types/config"

export interface NewsItemPayload {
  date: string
  title: string
  excerpt: string
  image: string
  body: string
  showImageOnFullContent: boolean
  authorId: number
}

export const newsApi = {
  listManage: () => apiClient.get<NewsItem[]>("/news/manage"),
  create: (payload: NewsItemPayload) => apiClient.post<NewsItem>("/news", payload),
  update: (id: number, payload: NewsItemPayload) =>
    apiClient.put<NewsItem>(`/news/${id}`, payload),
  remove: (id: number) => apiClient.del<void>(`/news/${id}`),
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append("image", file)
    return apiClient.upload<{ url: string }>("/news/upload-image", formData)
  },
}
