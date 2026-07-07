import { NavLink, Outlet } from "react-router-dom"

import { cn } from "@/lib/utils"
import { navSections } from "@/lib/nav"

export function AppShell() {
  return (
    <div className="flex min-h-svh">
      <aside className="w-56 shrink-0 border-r bg-sidebar text-sidebar-foreground">
        <div className="px-4 py-4 font-heading text-base font-semibold">
          Parafia — panel
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
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
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
