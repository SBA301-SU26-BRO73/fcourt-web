import type { AuthUser, TokenResponse } from '@/types/auth'

const ACCESS_KEY = 'fcourt_access'
const REFRESH_KEY = 'fcourt_refresh'
const USER_KEY = 'fcourt_user'

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`
}

export function decodeJwt(token: string): AuthUser {
  const payload = token.split('.')[1]
  const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  return {
    id: decoded.u_id ?? decoded.sub,
    email: decoded.email ?? decoded.sub ?? '',
    role: decoded.u_role ?? 'CUSTOMER',
  }
}

export const tokenStorage = {
  setTokens(tokens: TokenResponse): void {
    const msLeft = tokens.expiresIn - Date.now()
    const days = msLeft > 0 ? Math.ceil(msLeft / 86400000) : 1
    setCookie(ACCESS_KEY, tokens.accessToken, days)
    setCookie(REFRESH_KEY, tokens.refreshToken, 7)
  },

  getAccessToken(): string | null {
    return getCookie(ACCESS_KEY)
  },

  getRefreshToken(): string | null {
    return getCookie(REFRESH_KEY)
  },

  setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  },

  clear(): void {
    deleteCookie(ACCESS_KEY)
    deleteCookie(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
