import { apiClient } from "@/lib/api-client"
import type { Navbar, NavItem } from "@/types/config"

type NavItemPayload = Omit<NavItem, "id" | "isLocked" | "children"> & {
  id?: number
  children: Array<Omit<NavItem, "id" | "isLocked" | "children"> & { id?: number }>
}

export interface NavbarUpdatePayload {
  items: NavItemPayload[]
}

export const navbarApi = {
  get: () => apiClient.get<Navbar>("/navbar"),
  update: (payload: NavbarUpdatePayload) => apiClient.put<Navbar>("/navbar", payload),
}
