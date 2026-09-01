import { apiClient } from "@/lib/api-client"
import type { ContentTopic } from "@/types/config"

export interface ContentTopicPayload {
  iconUrl: string | null
  title: string
  content: string
  visibleFrom: string | null
  authorId: number
}

export interface TopicsApi {
  listManage: () => Promise<ContentTopic[]>
  create: (payload: ContentTopicPayload) => Promise<ContentTopic>
  update: (id: number, payload: ContentTopicPayload) => Promise<ContentTopic>
  remove: (id: number) => Promise<void>
  uploadImage: (file: File) => Promise<{ url: string }>
}

function createTopicsApi(basePath: string): TopicsApi {
  return {
    listManage: () => apiClient.get<ContentTopic[]>(`${basePath}/manage`),
    create: (payload) => apiClient.post<ContentTopic>(basePath, payload),
    update: (id, payload) => apiClient.put<ContentTopic>(`${basePath}/${id}`, payload),
    remove: (id) => apiClient.del<void>(`${basePath}/${id}`),
    uploadImage: (file) => {
      const formData = new FormData()
      formData.append("image", file)
      return apiClient.upload<{ url: string }>(`${basePath}/upload-image`, formData)
    },
  }
}

export const sakramentyTopicsApi = createTopicsApi("/sakramenty-topics")
export const parafiaTopicsApi = createTopicsApi("/parafia-topics")
export const liturgiaTopicsApi = createTopicsApi("/liturgia-topics")
