import { lazy, Suspense, type ReactNode } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"

import { AppShell } from "@/components/layout/AppShell"
import { AuthProvider } from "@/context/AuthProvider"
import { ThemeProvider } from "@/context/ThemeProvider"
import { useAuth } from "@/context/useAuth"
import { allNavLinks } from "@/lib/nav"
import { ComingSoonPage } from "@/pages/ComingSoonPage/ComingSoonPage"
import { LoginPage } from "@/pages/Login/LoginPage"

const ThemePage = lazy(() =>
  import("@/pages/Theme/ThemePage").then((m) => ({ default: m.ThemePage }))
)
const HeroPage = lazy(() =>
  import("@/pages/Hero/HeroPage").then((m) => ({ default: m.HeroPage }))
)

const pageFallback = <p className="text-sm text-muted-foreground">Ładowanie…</p>

function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Ładowanie…
      </div>
    )
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
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
            {allNavLinks
              .filter((link) => link.to !== "/theme" && link.to !== "/hero")
              .map((link) => (
                <Route
                  key={link.to}
                  path={link.to}
                  element={<ComingSoonPage title={link.label} />}
                />
              ))}
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
