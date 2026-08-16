import { apiClient } from "@/lib/api-client"
import type { Hero, HeroButton } from "@/types/config"

export type HeroUpdatePayload = Omit<Hero, "buttons"> & {
  buttons: Array<Omit<HeroButton, "id"> & { id?: number }>
}

export const heroApi = {
  get: () => apiClient.get<Hero>("/hero"),
  update: (hero: HeroUpdatePayload) => apiClient.put<Hero>("/hero", hero),
  uploadBackgroundImage: (file: File) => {
    const formData = new FormData()
    formData.append("image", file)
    return apiClient.upload<{ url: string }>("/hero/background-image", formData)
  },
}
