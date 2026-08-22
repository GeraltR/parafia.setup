import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/context/useTheme"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Włącz jasny motyw" : "Włącz ciemny motyw"}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
