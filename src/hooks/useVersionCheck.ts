import { useCallback, useEffect, useRef, useState } from "react"

const CHECK_INTERVAL_MS = 5 * 60 * 1000

export function useVersionCheck() {
  const [newVersionAvailable, setNewVersionAvailable] = useState(false)
  const timerRef = useRef<number | null>(null)

  const checkVersion = useCallback(async () => {
    if (import.meta.env.DEV) {
      return
    }
    try {
      const response = await fetch(`/version.json?_=${Date.now()}`, { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        if (data.version && data.version !== __APP_VERSION__) {
          setNewVersionAvailable(true)
          return
        }
      }
    } catch {
      // brak połączenia — spróbujemy ponownie przy kolejnym sprawdzeniu
    }
    timerRef.current = window.setTimeout(checkVersion, CHECK_INTERVAL_MS)
  }, [])

  useEffect(() => {
    if (import.meta.env.DEV) {
      return
    }
    timerRef.current = window.setTimeout(checkVersion, CHECK_INTERVAL_MS)
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [checkVersion])

  function dismiss() {
    setNewVersionAvailable(false)
    timerRef.current = window.setTimeout(checkVersion, CHECK_INTERVAL_MS)
  }

  function refresh() {
    window.location.reload()
  }

  return { newVersionAvailable, dismiss, refresh }
}
