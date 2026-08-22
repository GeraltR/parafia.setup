import { useCallback, useEffect, useState, type ReactNode } from "react"

import { authApi } from "@/api/auth"
import { AuthContext, type AuthContextValue, type AuthStatus } from "@/context/authContext"
import { getAuthToken, setAuthToken } from "@/lib/api-client"
import type { AuthUser } from "@/types/auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")

  useEffect(() => {
    if (!getAuthToken()) {
      setStatus("unauthenticated")
      return
    }

    authApi
      .me()
      .then((me) => {
        setUser(me)
        setStatus("authenticated")
      })
      .catch(() => {
        setAuthToken(null)
        setStatus("unauthenticated")
      })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedInUser } = await authApi.login(email, password)
    setAuthToken(token)
    setUser(loggedInUser)
    setStatus("authenticated")
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Token may already be invalid server-side — clear local state regardless.
    }
    setAuthToken(null)
    setUser(null)
    setStatus("unauthenticated")
  }, [])

  const value: AuthContextValue = { user, status, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
