import { apiClient } from "@/lib/api-client"
import type { MassAndPastorData } from "@/types/config"

export interface MassAndPastorPayload {
  config: {
    positionFont: string | null
    positionSize: string | null
    positionColor: string | null
    nameFont: string | null
    nameSize: string | null
    nameColor: string | null
  }
  massTimes: Array<{
    id?: number
    label: string
    hours: string
    note: string | null
  }>
  pastors: Array<{
    id?: number
    position: string
    fullName: string
    photoUrl: string | null
    duties: string
  }>
}

export const massAndPastorApi = {
  get: () => apiClient.get<MassAndPastorData>("/mass-and-pastor"),
  update: (payload: MassAndPastorPayload) =>
    apiClient.put<MassAndPastorData>("/mass-and-pastor", payload),
  uploadPhoto: (file: File) => {
    const formData = new FormData()
    formData.append("photo", file)
    return apiClient.upload<{ url: string }>("/mass-and-pastor/upload-photo", formData)
  },
}
