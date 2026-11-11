import { beforeEach, describe, expect, it, vi } from 'vitest'

import { decodeJwt, tokenStorage } from './token'

const USER_KEY = 'fcourt_user'
const LAST_ROLE_KEY = 'fcourt_last_role'

function createStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => {
      values.delete(key)
    },
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
}

function encodeJwtPart(value: unknown): string {
  return btoa(JSON.stringify(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function jwt(payload: Record<string, unknown>): string {
  return [encodeJwtPart({ alg: 'none', typ: 'JWT' }), encodeJwtPart(payload), 'signature'].join('.')
}

function clearCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0]?.trim()
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: createStorage(),
  })
  clearCookies()
  localStorage.clear()
})

describe('decodeJwt', () => {
  it('reads the numeric sub and the first role from roles[]', () => {
    const token = jwt({ sub: '42', roles: ['ADMIN'] })

    expect(decodeJwt(token)).toEqual({ id: 42, email: '', role: 'ADMIN' })
  })

  it('accepts Spring-style ROLE_ prefixes', () => {
    expect(decodeJwt(jwt({ sub: '1', roles: ['ROLE_SUPER_ADMIN'] })).role).toBe('SUPER_ADMIN')
  })

  it('falls back to CUSTOMER when roles are missing or unknown', () => {
    expect(decodeJwt(jwt({ sub: 77 }))).toEqual({ id: 77, email: '', role: 'CUSTOMER' })
    expect(decodeJwt(jwt({ sub: 78, roles: ['OWNER'] })).role).toBe('CUSTOMER')
  })

  it('ignores the old u_id / u_role claims', () => {
    expect(decodeJwt(jwt({ sub: '5', u_id: 99, u_role: 'ADMIN' }))).toEqual({
      id: 5,
      email: '',
      role: 'CUSTOMER',
    })
  })

  it('throws for malformed JWT values', () => {
    expect(() => decodeJwt('not-a-jwt')).toThrow()
  })
})

describe('tokenStorage', () => {
  it('sets and reads access and refresh tokens through cookies', () => {
    const accessToken = jwt({ sub: '5', roles: ['STAFF'] })

    tokenStorage.setTokens({
      accessToken,
      refreshToken: 'refresh-token',
      expiresIn: 900,
      user: {
        id: 5,
        email: 'staff@example.com',
        fullName: 'Staff',
        phone: null,
        role: 'STAFF',
        status: 'ACTIVE',
      },
    })

    expect(tokenStorage.getAccessToken()).toBe(accessToken)
    expect(tokenStorage.getRefreshToken()).toBe('refresh-token')
    expect(tokenStorage.getUser()).toEqual({
      id: 5,
      email: 'staff@example.com',
      role: 'STAFF',
      fullName: 'Staff',
    })
    expect(tokenStorage.getLastRole()).toBe('STAFF')
  })

  it('treats expiresIn as seconds: the access cookie lives that long from now', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-21T00:00:00.000Z'))
    const cookieSetter = vi.spyOn(document, 'cookie', 'set')
    const accessToken = jwt({ sub: '1', roles: ['CUSTOMER'] })

    tokenStorage.setTokens({ accessToken, refreshToken: 'refresh-token', expiresIn: 900 })

    expect(cookieSetter).toHaveBeenCalledWith(
      `fcourt_access=${accessToken}; expires=Tue, 21 Jul 2026 00:15:00 GMT; path=/; SameSite=Strict`,
    )
    expect(cookieSetter).toHaveBeenCalledWith(
      'fcourt_refresh=refresh-token; expires=Thu, 20 Aug 2026 00:00:00 GMT; path=/; SameSite=Strict',
    )
  })

  it('uses a one-day access cookie when expiresIn is missing or not positive', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-21T00:00:00.000Z'))
    const cookieSetter = vi.spyOn(document, 'cookie', 'set')
    const accessToken = jwt({ sub: '1', roles: ['CUSTOMER'] })

    tokenStorage.setTokens({ accessToken, refreshToken: 'refresh-token', expiresIn: 0 })

    expect(cookieSetter).toHaveBeenCalledWith(
      `fcourt_access=${accessToken}; expires=Wed, 22 Jul 2026 00:00:00 GMT; path=/; SameSite=Strict`,
    )
  })

  it('keeps the known email across a refresh that has no user object', () => {
    const accessToken = jwt({ sub: '3', roles: ['ADMIN'] })
    tokenStorage.setUser({ id: 3, email: 'owner@example.com', role: 'ADMIN', fullName: 'Owner' })

    tokenStorage.setTokens({ accessToken, refreshToken: 'rotated', expiresIn: 900 })

    expect(tokenStorage.getUser()?.email).toBe('owner@example.com')
    expect(tokenStorage.getRefreshToken()).toBe('rotated')
  })

  it('removes saved user when storing a malformed access token', () => {
    tokenStorage.setUser({ id: 9, email: 'old@example.com', role: 'ADMIN' })

    tokenStorage.setTokens({
      accessToken: 'malformed-token',
      refreshToken: 'refresh-token',
      expiresIn: 900,
    })

    expect(tokenStorage.getAccessToken()).toBe('malformed-token')
    expect(tokenStorage.getRefreshToken()).toBe('refresh-token')
    expect(tokenStorage.getUser()).toBeNull()
  })

  it('returns null for missing or invalid stored users', () => {
    expect(tokenStorage.getUser()).toBeNull()

    localStorage.setItem(USER_KEY, '{bad-json')

    expect(tokenStorage.getUser()).toBeNull()
  })

  it('ignores invalid last roles', () => {
    localStorage.setItem(LAST_ROLE_KEY, 'OWNER')

    expect(tokenStorage.getLastRole()).toBeNull()
  })

  it('clears token cookies and the saved user', () => {
    const accessToken = jwt({ sub: '3', roles: ['ADMIN'] })
    tokenStorage.setTokens({ accessToken, refreshToken: 'refresh-token', expiresIn: 900 })

    tokenStorage.clear()

    expect(tokenStorage.getAccessToken()).toBeNull()
    expect(tokenStorage.getRefreshToken()).toBeNull()
    expect(tokenStorage.getUser()).toBeNull()
  })
})
