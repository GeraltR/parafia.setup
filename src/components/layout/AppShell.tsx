import { NavLink, Outlet } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/useAuth"
import { navSections } from "@/lib/nav"
import { cn } from "@/lib/utils"

export function AppShell() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-svh">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="px-4 py-4 font-heading text-base font-semibold">
          Parafia — panel
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2">
          {navSections.map((section) => (
            <NavLink
              key={section.to}
              to={section.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                )
              }
            >
              {section.label}
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="border-t px-4 py-3">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-start px-2"
              onClick={() => logout()}
            >
              Wyloguj
            </Button>
          </div>
        )}
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
