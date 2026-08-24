import type { PermissionLevel } from "@/types/auth"

export const PERMISSION_LEVEL_OPTIONS: { value: PermissionLevel; label: string }[] = [
  { value: 7, label: "Supervisor" },
  { value: 3, label: "Administrator" },
  { value: 1, label: "Redaktor" },
  { value: 0, label: "Przeglądanie" },
]
