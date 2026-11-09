import { describe, expect, it } from 'vitest'

import { resolveWsUrl } from './env'

describe('resolveWsUrl', () => {
  it('prefers VITE_WS_URL', () => {
    expect(resolveWsUrl('wss://api.example.com/ws-fcourt', { protocol: 'https:', host: 'x' })).toBe(
      'wss://api.example.com/ws-fcourt',
    )
  })

  it('falls back to the same origin, secure when the page is https', () => {
    expect(resolveWsUrl(undefined, { protocol: 'http:', host: 'localhost:5173' })).toBe('ws://localhost:5173/ws-fcourt')
    expect(resolveWsUrl(undefined, { protocol: 'https:', host: 'fcourt.vn' })).toBe('wss://fcourt.vn/ws-fcourt')
  })
})
