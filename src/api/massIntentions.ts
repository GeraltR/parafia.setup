import { apiClient } from "@/lib/api-client"
import type { MassIntention, MassIntentionsConfig, MassIntentionsManageData } from "@/types/config"

export interface MassIntentionPayload {
  date: string
  time: string
  intention: string
  isHoliday: boolean
  dayDescription: string | null
  authorId: number | null
}

export interface MassIntentionsConfigPayload {
  holidayDescribedColor: string
  holidayPlainColor: string
  weekdayColor: string
}

export const massIntentionsApi = {
  listManage: (page: number = 1, search: string = "") =>
    apiClient.get<MassIntentionsManageData>(
      `/mass-intentions/manage?page=${page}&search=${encodeURIComponent(search)}`
    ),
  create: (payload: MassIntentionPayload) =>
    apiClient.post<MassIntention>("/mass-intentions", payload),
  update: (id: number, payload: MassIntentionPayload) =>
    apiClient.put<MassIntention>(`/mass-intentions/${id}`, payload),
  remove: (id: number) => apiClient.del<void>(`/mass-intentions/${id}`),
  updateConfig: (payload: MassIntentionsConfigPayload) =>
    apiClient.put<MassIntentionsConfig>("/mass-intentions/config", payload),
  printList: (from: string) =>
    apiClient.get<MassIntention[]>(`/mass-intentions/print?from=${from}`),
}
