import { useEffect, useState } from "react"
import { NavLink, Outlet } from "react-router-dom"

import { footerApi } from "@/api/footer"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { VersionUpdateModal } from "@/components/VersionUpdateModal"
import { useAuth } from "@/context/useAuth"
import { navGroups } from "@/lib/nav"
import { cn } from "@/lib/utils"

export function AppShell() {
  const { user, logout } = useAuth()
  const [copyrightText, setCopyrightText] = useState("")

  useEffect(() => {
    footerApi
      .get()
      .then((data) => setCopyrightText(data.copyrightText))
      .catch(() => setCopyrightText(""))
  }, [])

  return (
    <div className="flex h-svh">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="px-4 py-4 font-heading text-base font-semibold">
          Parafia — panel
        </div>
        <nav className="flex flex-1 flex-col gap-3 px-2">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="rounded-md bg-sky-100 px-2.5 py-1 text-xs font-bold tracking-wide text-sky-900 uppercase dark:bg-sky-950 dark:text-sky-200">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="grid grid-cols-[auto_1fr_auto] items-start gap-3 border-b px-6 py-2.5">
          <span className="text-xs text-muted-foreground">wersja: {__APP_VERSION__}</span>
          <span className="text-center text-xs text-muted-foreground">{copyrightText}</span>
          <div className="flex items-center gap-3 justify-self-end">
            <ThemeToggle />
            {user && (
              <>
                <div className="text-right leading-tight">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.permissionLevelLabel}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => logout()}>
                  Wyloguj
                </Button>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <VersionUpdateModal />
    </div>
  )
}
