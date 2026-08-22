import { apiClient } from "@/lib/api-client"
import type { AuthUser } from "@/types/auth"

export interface LoginResponse {
  token: string
  user: AuthUser
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>("/login", { email, password }),
  logout: () => apiClient.post<void>("/logout", {}),
  me: () => apiClient.get<AuthUser>("/me"),
}
