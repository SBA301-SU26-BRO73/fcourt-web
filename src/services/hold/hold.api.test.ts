import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import { holdSlots, InvalidHoldResponseError, parseHoldResponse, releaseHold } from './hold.api'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: { post: vi.fn(), delete: vi.fn() },
  SKIP_AUTH_HEADER: 'X-Skip-Auth',
}))

const http = vi.mocked(axiosClient)
const TOKEN = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'

beforeEach(() => vi.clearAllMocks())

describe('hold-slots', () => {
  it('posts the HoldRequest and returns the token with an absolute expiry', async () => {
    const expiresAt = new Date(Date.now() + 300_000).toISOString()
    http.post.mockResolvedValue({
      data: { holdToken: TOKEN, expiresAt, expiresInSeconds: 300, courtId: 4, date: '2030-01-01', slotIds: [1, 2] },
    })
    const payload = { courtId: 4, date: '2030-01-01', slotIds: [1, 2], guestPhone: '0912345678' }
    const result = await holdSlots(payload)
    expect(http.post).toHaveBeenCalledWith('/bookings/hold-slots', payload)
    expect(result.holdToken).toBe(TOKEN)
    expect(result.expiresAt).toBe(Date.parse(expiresAt))
  })

  it('releases by token with DELETE', async () => {
    http.delete.mockResolvedValue({ status: 204 })
    await releaseHold(TOKEN)
    expect(http.delete).toHaveBeenCalledWith(`/bookings/hold-slots/${TOKEN}`, { headers: { 'X-Skip-Auth': '1' } })
  })

  it('retries once on a server error and gives up on a client error', async () => {
    http.delete.mockRejectedValueOnce({ status: 503 }).mockResolvedValueOnce({ status: 204 })
    await releaseHold(TOKEN)
    expect(http.delete).toHaveBeenCalledTimes(2)

    http.delete.mockReset()
    http.delete.mockRejectedValue({ status: 400 })
    await expect(releaseHold(TOKEN)).rejects.toEqual({ status: 400 })
    expect(http.delete).toHaveBeenCalledTimes(1)
  })
})

describe('parseHoldResponse', () => {
  const now = Date.parse('2030-01-01T00:00:00Z')

  it('rejects a malformed token, a missing or an already expired expiry', () => {
    const future = new Date(now + 1000).toISOString()
    expect(() => parseHoldResponse({ holdToken: 'abc', expiresAt: future }, now)).toThrow(InvalidHoldResponseError)
    expect(() => parseHoldResponse({ holdToken: TOKEN }, now)).toThrow(InvalidHoldResponseError)
    expect(() => parseHoldResponse({ holdToken: TOKEN, expiresAt: 'nope' }, now)).toThrow(InvalidHoldResponseError)
    expect(() => parseHoldResponse({ holdToken: TOKEN, expiresAt: new Date(now - 1).toISOString() }, now)).toThrow(
      InvalidHoldResponseError,
    )
    expect(() => parseHoldResponse(null, now)).toThrow(InvalidHoldResponseError)
  })

  it('accepts a valid future hold', () => {
    const parsed = parseHoldResponse({ holdToken: TOKEN, expiresAt: new Date(now + 1000).toISOString() }, now)
    expect(parsed.expiresAt).toBe(now + 1000)
  })
})
