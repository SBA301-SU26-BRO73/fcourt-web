import { USER_ROLES, type AuthUser, type TokenResponse, type UserRole } from '@/types/auth'

const ACCESS_KEY = 'fcourt_access'
const REFRESH_KEY = 'fcourt_refresh'
const USER_KEY = 'fcourt_user'
const LAST_ROLE_KEY = 'fcourt_last_role'

const DAY_MS = 864e5
/** auth-service refresh token TTL is 30 days (auth-service application.yml). */
const REFRESH_COOKIE_MS = 30 * DAY_MS

function setCookie(name: string, value: string, expiresAtMs: number) {
  const expires = new Date(expiresAtMs).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`
}

/** Accept `ADMIN` and Spring-style `ROLE_ADMIN`; anything unknown falls back to CUSTOMER. */
export function normalizeRole(value: unknown): UserRole {
  const raw = typeof value === 'string' ? value.replace(/^ROLE_/, '') : ''
  return USER_ROLES.includes(raw as UserRole) ? (raw as UserRole) : 'CUSTOMER'
}

/**
 * Read the identity from the access token. The JWT only carries `sub` (numeric user
 * id) and `roles[]`; email and full name come from the auth response / profile.
 */
export function decodeJwt(token: string): AuthUser {
  const payload = token.split('.')[1]
  const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  const roles: unknown[] = Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles]
  return {
    id: Number(decoded.sub),
    email: '',
    role: normalizeRole(roles[0]),
  }
}

/** Absolute expiry (epoch ms) of the access cookie; `expiresIn` is in seconds. */
function accessExpiryMs(expiresInSeconds: number): number {
  return Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
    ? Date.now() + expiresInSeconds * 1000
    : Date.now() + DAY_MS
}

export const tokenStorage = {
  /** Store both tokens. The refresh token rotates, so call this after every refresh too. */
  setTokens(tokens: TokenResponse): void {
    setCookie(ACCESS_KEY, tokens.accessToken, accessExpiryMs(tokens.expiresIn))
    setCookie(REFRESH_KEY, tokens.refreshToken, Date.now() + REFRESH_COOKIE_MS)
    try {
      const fromJwt = decodeJwt(tokens.accessToken)
      const previous = this.getUser()
      const known = tokens.user ?? (previous?.id === fromJwt.id ? previous : undefined)
      this.setUser({
        ...fromJwt,
        email: known?.email ?? '',
        fullName: known?.fullName ?? null,
      })
    } catch {
      localStorage.removeItem(USER_KEY)
    }
  },

  getAccessToken(): string | null {
    return getCookie(ACCESS_KEY)
  },

  getRefreshToken(): string | null {
    return getCookie(REFRESH_KEY)
  },

  setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    localStorage.setItem(LAST_ROLE_KEY, user.role)
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

  getLastRole(): AuthUser['role'] | null {
    const role = localStorage.getItem(LAST_ROLE_KEY)
    return USER_ROLES.includes(role as UserRole) ? (role as UserRole) : null
  },

  clear(): void {
    deleteCookie(ACCESS_KEY)
    deleteCookie(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
