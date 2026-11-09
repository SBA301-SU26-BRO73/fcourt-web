import { describe, expect, it } from 'vitest'

import { ApiError } from '@/common/utils/api-error'
import { safeNextPath } from '@/utils/redirect'

import {
  buildVietQrUrl,
  classifyCheckoutError,
  isFreeCheckout,
  nextPollDelay,
  parsePositiveInt,
  POLL_DEADLINE_MS,
  resolveConfirmationView,
  resolveHoldCheckoutStage,
} from './payment.utils'

const err = (status: number) => new ApiError({ status, message: 'x' })

describe('payment utils', () => {
  it('builds the VietQR link from server bank data', () => {
    const url = buildVietQrUrl({ bankBin: '970422', bankAccountNumber: '0123', bankAccountName: 'NGUYEN A', amount: 150000, transferContent: 'FC AB12' })
    expect(url).toContain('/970422-0123-compact2.png?')
    expect(url).toContain('amount=150000')
    expect(url).toContain('addInfo=FC+AB12')
  })

  it('detects a free checkout', () => {
    expect(isFreeCheckout({ amount: 0 })).toBe(true)
    expect(isFreeCheckout({ amount: 1 })).toBe(false)
  })

  it('polls every 4s, backs off to 30s, stops on decision or deadline', () => {
    const base = { startedAt: 0, now: 1000 }
    expect(nextPollDelay({ ...base, state: 'PENDING', failures: 0 })).toBe(4000)
    expect(nextPollDelay({ ...base, state: null, failures: 1 })).toBe(8000)
    expect(nextPollDelay({ ...base, state: null, failures: 5 })).toBe(30000)
    expect(nextPollDelay({ ...base, state: 'SUCCESS', failures: 0 })).toBe(false)
    expect(nextPollDelay({ ...base, state: 'REJECTED', failures: 0 })).toBe(false)
    expect(nextPollDelay({ state: 'PENDING', failures: 0, startedAt: 0, now: POLL_DEADLINE_MS })).toBe(false)
  })

  it('classifies checkout errors', () => {
    expect(classifyCheckoutError(err(410))).toBe('expired')
    expect(classifyCheckoutError(err(409))).toBe('not-awaiting-payment')
    expect(classifyCheckoutError(err(403))).toBe('forbidden')
    expect(classifyCheckoutError(err(404))).toBe('not-found')
    expect(classifyCheckoutError(new Error('x'))).toBe('other')
  })

  it('resolves the hold checkout stage', () => {
    const base = { hasHold: true, expired: false, role: 'CUSTOMER', createFailed: false }
    expect(resolveHoldCheckoutStage({ ...base, hasHold: false })).toBe('empty')
    expect(resolveHoldCheckoutStage({ ...base, expired: true })).toBe('expired')
    expect(resolveHoldCheckoutStage({ ...base, role: null })).toBe('login')
    expect(resolveHoldCheckoutStage({ ...base, role: 'STAFF' })).toBe('wrong-role')
    expect(resolveHoldCheckoutStage(base)).toBe('creating')
    expect(resolveHoldCheckoutStage({ ...base, createFailed: true })).toBe('error')
  })

  it('resolves the confirmation view', () => {
    const base = { paymentState: null, rejectReason: null, paymentError: null, bookingStatus: 'AWAITING_CONFIRMATION', checkInCode: null, deadlineReached: false } as const
    expect(resolveConfirmationView(base)).toEqual({ kind: 'pending', stalled: false })
    expect(resolveConfirmationView({ ...base, deadlineReached: true })).toEqual({ kind: 'pending', stalled: true })
    expect(resolveConfirmationView({ ...base, paymentState: 'SUCCESS' })).toEqual({ kind: 'approved', hasTicket: false })
    expect(resolveConfirmationView({ ...base, bookingStatus: 'CONFIRMED', checkInCode: 'c' })).toEqual({ kind: 'approved', hasTicket: true })
    expect(resolveConfirmationView({ ...base, paymentState: 'REJECTED', rejectReason: 'mờ' })).toEqual({ kind: 'rejected', reason: 'mờ' })
    expect(resolveConfirmationView({ ...base, bookingStatus: 'CANCELLED' })).toEqual({ kind: 'cancelled' })
    expect(resolveConfirmationView({ ...base, paymentError: err(410) })).toEqual({ kind: 'cancelled' })
    expect(resolveConfirmationView({ ...base, paymentError: err(404) })).toEqual({ kind: 'pending', stalled: false })
    expect(resolveConfirmationView({ ...base, paymentError: err(500) }).kind).toBe('error')
  })

  it('parses ids and safe redirects', () => {
    expect(parsePositiveInt('12')).toBe(12)
    expect(parsePositiveInt('0')).toBeNull()
    expect(parsePositiveInt('1a')).toBeNull()
    expect(safeNextPath('/payment')).toBe('/payment')
    expect(safeNextPath('//evil.com')).toBeNull()
    expect(safeNextPath('https://evil.com')).toBeNull()
  })
})
