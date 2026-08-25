import { apiClient } from "@/lib/api-client"
import type { AuthUser } from "@/types/auth"

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface MessageResponse {
  message: string
}

export interface ResetPasswordPayload {
  token: string
  email: string
  password: string
  passwordConfirmation: string
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>("/login", { email, password }),
  logout: () => apiClient.post<void>("/logout", {}),
  me: () => apiClient.get<AuthUser>("/me"),
  forgotPassword: (email: string) =>
    apiClient.post<MessageResponse>("/forgot-password", { email }),
  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<MessageResponse>("/reset-password", payload),
}
