export type PermissionLevel = 0 | 1 | 3 | 7

export interface AuthUser {
  id: number
  name: string
  email: string
  permissionLevel: PermissionLevel
  canWrite: boolean
}
