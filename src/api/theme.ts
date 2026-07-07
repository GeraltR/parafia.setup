import { apiClient } from "@/lib/api-client"
import type { Theme } from "@/types/config"

export const themeApi = {
  get: () => apiClient.get<Theme>("/theme"),
  update: (theme: Theme) => apiClient.put<Theme>("/theme", theme),
}
