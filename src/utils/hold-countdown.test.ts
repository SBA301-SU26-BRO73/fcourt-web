import { describe, expect, it } from 'vitest'

import { formatCountdown, HOLD_WARNING_SECONDS, isHoldExpired, isHoldWarning, remainingSeconds } from './hold-countdown'

describe('hold countdown', () => {
  it('derives the remaining time from the absolute expiry and never goes negative', () => {
    expect(remainingSeconds(10_000, 4_500)).toBe(6)
    expect(remainingSeconds(10_000, 10_000)).toBe(0)
    expect(remainingSeconds(10_000, 20_000)).toBe(0)
  })

  it('is expired at and after the expiry instant', () => {
    expect(isHoldExpired(1000, 999)).toBe(false)
    expect(isHoldExpired(1000, 1000)).toBe(true)
  })

  it('formats mm:ss', () => {
    expect(formatCountdown(300)).toBe('05:00')
    expect(formatCountdown(65)).toBe('01:05')
    expect(formatCountdown(-3)).toBe('00:00')
  })

  it('warns in the last minute only while still running', () => {
    expect(isHoldWarning(HOLD_WARNING_SECONDS)).toBe(true)
    expect(isHoldWarning(HOLD_WARNING_SECONDS + 1)).toBe(false)
    expect(isHoldWarning(0)).toBe(false)
  })
})
