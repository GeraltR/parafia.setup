import { apiClient } from "@/lib/api-client"
import type { ContentPageSlug, ContentTopic } from "@/types/config"

export interface ContentTopicPayload {
  iconUrl: string | null
  title: string
  content: string
  visibleFrom: string | null
  authorId: number
}

export const contentTopicsApi = {
  listManage: (page: ContentPageSlug) =>
    apiClient.get<ContentTopic[]>(`/content-topics/manage?page=${page}`),
  create: (page: ContentPageSlug, payload: ContentTopicPayload) =>
    apiClient.post<ContentTopic>("/content-topics", { page, ...payload }),
  update: (id: number, payload: ContentTopicPayload) =>
    apiClient.put<ContentTopic>(`/content-topics/${id}`, payload),
  remove: (id: number) => apiClient.del<void>(`/content-topics/${id}`),
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append("image", file)
    return apiClient.upload<{ url: string }>("/content-topics/upload-image", formData)
  },
}
