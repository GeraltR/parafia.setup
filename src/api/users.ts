import { apiClient } from "@/lib/api-client"
import type { AuthUser, PermissionLevel } from "@/types/auth"

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  passwordConfirmation: string
  permissionLevel: PermissionLevel
}

export interface UpdatePasswordPayload {
  newPassword: string
  newPasswordConfirmation: string
}

export interface UpdateUserPayload {
  name: string
  email: string
  permissionLevel: PermissionLevel
}

export const usersApi = {
  list: () => apiClient.get<AuthUser[]>("/users"),
  create: (payload: CreateUserPayload) => apiClient.post<AuthUser>("/users", payload),
  update: (userId: number, payload: UpdateUserPayload) =>
    apiClient.put<AuthUser>(`/users/${userId}`, payload),
  updatePassword: (userId: number, payload: UpdatePasswordPayload) =>
    apiClient.put<void>(`/users/${userId}/password`, payload),
  remove: (userId: number) => apiClient.del<void>(`/users/${userId}`),
}
