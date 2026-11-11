import { beforeEach, describe, expect, it } from 'vitest'

import { clearGuestBookingToken, loadGuestBookingToken, saveGuestBookingToken } from './guest-booking-storage'

beforeEach(() => sessionStorage.clear())

describe('guest booking storage', () => {
  it('keeps the hold token per booking', () => {
    saveGuestBookingToken(7, 'token-7')
    saveGuestBookingToken(8, 'token-8')
    expect(loadGuestBookingToken(7)).toBe('token-7')
    expect(loadGuestBookingToken(8)).toBe('token-8')
    expect(loadGuestBookingToken(9)).toBeNull()
  })

  it('forgets a token', () => {
    saveGuestBookingToken(7, 'token-7')
    clearGuestBookingToken(7)
    expect(loadGuestBookingToken(7)).toBeNull()
  })

  it('returns null when storage throws', () => {
    const original = Storage.prototype.getItem
    Storage.prototype.getItem = () => {
      throw new Error('blocked')
    }
    try {
      expect(loadGuestBookingToken(7)).toBeNull()
    } finally {
      Storage.prototype.getItem = original
    }
  })
})
