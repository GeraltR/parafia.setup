export type PermissionLevel = 0 | 1 | 3 | 7

export interface AuthUserCanWrite {
  site: boolean
  content: boolean
  management: boolean
}

export interface AuthUser {
  id: number
  name: string
  email: string
  permissionLevel: PermissionLevel
  permissionLevelLabel: string
  canWrite: AuthUserCanWrite
}
