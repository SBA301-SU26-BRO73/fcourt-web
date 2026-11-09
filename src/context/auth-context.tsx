import { createContext, useState, type PropsWithChildren } from 'react'

import { logout as logoutRequest } from '@/services/auth/auth.service'
import { releaseHold } from '@/services/hold/hold.api'
import type { AuthUser, TokenResponse } from '@/types/auth'
import { clearActiveHold, loadActiveHold } from '@/utils/hold-storage'
import { tokenStorage } from '@/utils/token'

interface AuthContextValue {
  user: AuthUser | null
  isLoggedIn: boolean
  setAuth: (tokens: TokenResponse) => void
  /** Clear the local session only (use when the session is already gone). */
  clearAuth: () => void
  /** Tell the backend to revoke the refresh token, then clear the local session. */
  logout: () => Promise<void>
}

export type { AuthContextValue }
export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => tokenStorage.getUser())

  function setAuth(tokens: TokenResponse) {
    tokenStorage.setTokens(tokens)
    setUser(tokenStorage.getUser())
  }

  function clearAuth() {
    tokenStorage.clear()
    setUser(null)
  }

  async function logout() {
    // A hold belongs to the account that made it: give the slots back and forget it before the session ends.
    const hold = loadActiveHold()
    clearActiveHold()
    if (hold) await releaseHold(hold.holdToken).catch(() => undefined)
    const refreshToken = tokenStorage.getRefreshToken()
    try {
      if (refreshToken) await logoutRequest(refreshToken)
    } catch {
      // Logout is best effort: the local session must be cleared even if the call fails.
    } finally {
      clearAuth()
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, setAuth, clearAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
