import { useEffect, useState, type ReactNode } from "react"

import { ThemeContext, type ThemeMode } from "@/context/themeContext"

const STORAGE_KEY = "parafiasetup_theme"

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "dark" || stored === "light") {
    return stored
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
