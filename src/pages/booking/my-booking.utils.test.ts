import { describe, expect, it } from 'vitest'

import type { MyBooking } from '@/types/my-booking'

import {
  canRequestRefund,
  canReview,
  canTryCancel,
  formatClock,
  hasTicket,
  mayHaveRefund,
  transactionStatusLabel,
  validateRefundForm,
} from './my-booking.utils'

const booking = (status: MyBooking['status'], refundAmount: number | null = null) =>
  ({ status, refundAmount }) as MyBooking

describe('booking state helpers', () => {
  it('allows cancelling only unused bookings', () => {
    expect(canTryCancel(booking('PENDING_PAYMENT'))).toBe(true)
    expect(canTryCancel(booking('CONFIRMED'))).toBe(true)
    expect(canTryCancel(booking('CHECKED_IN'))).toBe(false)
    expect(canTryCancel(booking('CANCELLED'))).toBe(false)
  })

  it('shows the ticket only for confirmed, checked-in or completed bookings', () => {
    expect(hasTicket(booking('CONFIRMED'))).toBe(true)
    expect(hasTicket(booking('CHECKED_IN'))).toBe(true)
    expect(hasTicket(booking('COMPLETED'))).toBe(true)
    expect(hasTicket(booking('CANCELLED'))).toBe(false)
    expect(hasTicket(booking('PENDING_PAYMENT'))).toBe(false)
    expect(hasTicket(booking('AWAITING_CONFIRMATION'))).toBe(false)
  })

  it('looks up a refund only for cancelled bookings with an entitlement', () => {
    expect(mayHaveRefund(booking('CANCELLED', 100000))).toBe(true)
    expect(mayHaveRefund(booking('CANCELLED', 0))).toBe(false)
    expect(mayHaveRefund(booking('CANCELLED'))).toBe(false)
    expect(mayHaveRefund(booking('CONFIRMED', 100000))).toBe(false)
  })

  it('lets a customer review completed bookings only', () => {
    expect(canReview(booking('COMPLETED'))).toBe(true)
    expect(canReview(booking('CANCELLED'))).toBe(false)
  })

  it('requests a refund only when eligible and none exists yet', () => {
    expect(canRequestRefund({ bookingId: 1, amount: 1, eligible: true, request: null })).toBe(true)
    expect(canRequestRefund({ bookingId: 1, amount: 1, eligible: false, request: null })).toBe(false)
    expect(canRequestRefund(undefined)).toBe(false)
  })
})

describe('formatting', () => {
  it('cuts seconds from a time and labels transaction statuses', () => {
    expect(formatClock('18:30:00')).toBe('18:30')
    expect(transactionStatusLabel('SUCCESS')).toBe('Thành công')
    expect(transactionStatusLabel('PENDING')).toBe('Chờ xác nhận')
    expect(transactionStatusLabel('REJECTED')).toBe('Bị từ chối')
  })
})

describe('validateRefundForm', () => {
  const valid = { bankBin: '970436', accountNumber: '0123456789', accountName: 'NGUYEN VAN A', reason: 'bận' }

  it('accepts the shape the payment service accepts', () => {
    expect(validateRefundForm(valid)).toEqual({})
  })

  it('reports each invalid field', () => {
    const errors = validateRefundForm({ bankBin: '', accountNumber: '12', accountName: 'A', reason: ' ' })
    expect(Object.keys(errors).sort()).toEqual(['accountName', 'accountNumber', 'bankBin', 'reason'])
  })
})
