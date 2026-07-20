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
  it('decodes a valid JWT payload with auth claims', () => {
    const token = jwt({
      u_id: 42,
      email: 'admin@example.com',
      u_role: 'ADMIN',
    })

    expect(decodeJwt(token)).toEqual({
      id: 42,
      email: 'admin@example.com',
      role: 'ADMIN',
    })
  })

  it('falls back to subject and customer role when optional claims are missing', () => {
    const token = jwt({
      sub: 77,
    })

    expect(decodeJwt(token)).toEqual({
      id: 77,
      email: 77,
      role: 'CUSTOMER',
    })
  })

  it('throws for malformed JWT values', () => {
    expect(() => decodeJwt('not-a-jwt')).toThrow()
  })
})

describe('tokenStorage', () => {
  it('sets and reads access and refresh tokens through cookies', () => {
    const accessToken = jwt({
      u_id: 5,
      email: 'staff@example.com',
      u_role: 'STAFF',
    })

    tokenStorage.setTokens({
      accessToken,
      refreshToken: 'refresh-token',
      expiresIn: Date.now() + 2 * 86400000,
    })

    expect(tokenStorage.getAccessToken()).toBe(accessToken)
    expect(tokenStorage.getRefreshToken()).toBe('refresh-token')
    expect(tokenStorage.getUser()).toEqual({
      id: 5,
      email: 'staff@example.com',
      role: 'STAFF',
    })
    expect(tokenStorage.getLastRole()).toBe('STAFF')
  })

  it('uses a one-day access cookie when the token expiry is already past', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-21T00:00:00.000Z'))
    const cookieSetter = vi.spyOn(document, 'cookie', 'set')
    const accessToken = jwt({ u_id: 1, email: 'customer@example.com' })

    tokenStorage.setTokens({
      accessToken,
      refreshToken: 'refresh-token',
      expiresIn: Date.now() - 1000,
    })

    expect(cookieSetter).toHaveBeenCalledWith(
      `fcourt_access=${accessToken}; expires=Wed, 22 Jul 2026 00:00:00 GMT; path=/; SameSite=Strict`,
    )
    vi.useRealTimers()
  })

  it('removes saved user when storing a malformed access token', () => {
    tokenStorage.setUser({
      id: 9,
      email: 'old@example.com',
      role: 'ADMIN',
    })

    tokenStorage.setTokens({
      accessToken: 'malformed-token',
      refreshToken: 'refresh-token',
      expiresIn: Date.now() + 86400000,
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
    const accessToken = jwt({ u_id: 3, email: 'admin@example.com', u_role: 'ADMIN' })
    tokenStorage.setTokens({
      accessToken,
      refreshToken: 'refresh-token',
      expiresIn: Date.now() + 86400000,
    })

    tokenStorage.clear()

    expect(tokenStorage.getAccessToken()).toBeNull()
    expect(tokenStorage.getRefreshToken()).toBeNull()
    expect(tokenStorage.getUser()).toBeNull()
  })
})
