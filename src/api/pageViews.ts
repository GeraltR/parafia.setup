import { apiClient } from "@/lib/api-client"

export interface PageViewDailyPoint {
  date: string
  views: number
  uniqueVisitors: number
}

export interface PageViewTopPath {
  path: string
  views: number
}

export interface PageViewSummary {
  days: number
  totalViews: number
  totalUniqueVisitors: number
  daily: PageViewDailyPoint[]
  topPaths: PageViewTopPath[]
}

export const pageViewsApi = {
  summary: (days: number) => apiClient.get<PageViewSummary>(`/page-views/summary?days=${days}`),
}
