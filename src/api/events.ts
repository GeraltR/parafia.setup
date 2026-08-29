import { apiClient } from "@/lib/api-client"
import type { EventItem } from "@/types/config"

export interface EventItemPayload {
  date: string
  time: string
  title: string
  description: string
  body: string
  authorId: number
}

export const eventsApi = {
  listManage: () => apiClient.get<EventItem[]>("/events/manage"),
  create: (payload: EventItemPayload) => apiClient.post<EventItem>("/events", payload),
  update: (id: number, payload: EventItemPayload) =>
    apiClient.put<EventItem>(`/events/${id}`, payload),
  remove: (id: number) => apiClient.del<void>(`/events/${id}`),
}
