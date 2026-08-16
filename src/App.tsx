import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { AppShell } from "@/components/layout/AppShell"
import { navSections } from "@/lib/nav"
import { ComingSoonPage } from "@/pages/ComingSoonPage"

const ThemePage = lazy(() =>
  import("@/pages/ThemePage").then((m) => ({ default: m.ThemePage }))
)
const HeroPage = lazy(() => import("@/pages/HeroPage").then((m) => ({ default: m.HeroPage })))

const pageFallback = <p className="text-sm text-muted-foreground">Ładowanie…</p>

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/theme" replace />} />
        <Route
          path="/theme"
          element={
            <Suspense fallback={pageFallback}>
              <ThemePage />
            </Suspense>
          }
        />
        <Route
          path="/hero"
          element={
            <Suspense fallback={pageFallback}>
              <HeroPage />
            </Suspense>
          }
        />
        {navSections
          .filter((section) => section.to !== "/theme" && section.to !== "/hero")
          .map((section) => (
            <Route
              key={section.to}
              path={section.to}
              element={<ComingSoonPage title={section.label} />}
            />
          ))}
      </Route>
    </Routes>
  )
}

export default App
