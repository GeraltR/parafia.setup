import { apiClient } from "@/lib/api-client"
import type { SocialLinks } from "@/types/config"

export const socialApi = {
  get: () => apiClient.get<SocialLinks>("/social"),
  update: (payload: SocialLinks) => apiClient.put<SocialLinks>("/social", payload),
}
