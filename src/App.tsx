import { Navigate, Route, Routes } from "react-router-dom"

import { AppShell } from "@/components/layout/AppShell"
import { navSections } from "@/lib/nav"
import { ComingSoonPage } from "@/pages/ComingSoonPage"
import { ThemePage } from "@/pages/ThemePage"

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/theme" replace />} />
        <Route path="/theme" element={<ThemePage />} />
        {navSections
          .filter((section) => section.to !== "/theme")
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
