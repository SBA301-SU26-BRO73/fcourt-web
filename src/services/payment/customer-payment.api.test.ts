import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createBooking, holdTokenHeaders } from '@/services/booking/booking.api'
import { axiosClient } from '@/services/http/axios-client'

import { confirmFreeBooking, getCheckoutInfo, getPaymentStatus, uploadReceipt, validateReceiptFile } from './customer-payment.api'

vi.mock('@/services/http/axios-client', () => ({ axiosClient: { get: vi.fn(), post: vi.fn() } }))

const http = vi.mocked(axiosClient)

beforeEach(() => vi.clearAllMocks())

describe('customer booking and payment api', () => {
  it('creates a booking with the Idempotency-Key header and no price', async () => {
    http.post.mockResolvedValue({ data: { id: 5 } })
    const payload = { holdToken: 't', courtId: 1, date: '2030-01-01', slotIds: [1, 2] }
    await createBooking(payload, 'key-1')
    expect(http.post).toHaveBeenCalledWith('/bookings', payload, { headers: { 'Idempotency-Key': 'key-1' } })
  })

  it('reads checkout info, optionally with the guest hold token', async () => {
    http.get.mockResolvedValue({ data: {} })
    await getCheckoutInfo(7)
    expect(http.get).toHaveBeenCalledWith('/payments/checkout-info/7', { headers: undefined })
    await getCheckoutInfo(7, 'tok')
    expect(http.get).toHaveBeenLastCalledWith('/payments/checkout-info/7', { headers: { 'X-Hold-Token': 'tok' } })
    expect(holdTokenHeaders(null)).toBeUndefined()
  })

  it('uploads the receipt as multipart part "file"', async () => {
    http.post.mockResolvedValue({ data: { id: 1 } })
    const file = new File(['x'], 'r.png', { type: 'image/png' })
    await uploadReceipt(7, file)
    const [url, form] = http.post.mock.calls[0]
    expect(url).toBe('/payments/7/upload-receipt')
    expect((form as FormData).get('file')).toBeInstanceOf(File)
  })

  it('rejects bad receipt files before sending', async () => {
    expect(validateReceiptFile({ type: 'application/pdf', size: 10 })).toMatch(/PNG/)
    expect(validateReceiptFile({ type: 'image/png', size: 6 * 1024 * 1024 })).toMatch(/5MB/)
    await expect(uploadReceipt(1, new File(['x'], 'a.pdf', { type: 'application/pdf' }))).rejects.toThrow()
    expect(http.post).not.toHaveBeenCalled()
  })

  it('polls the compact status and confirms a free booking', async () => {
    http.get.mockResolvedValue({ data: {} })
    http.post.mockResolvedValue({ data: {} })
    await getPaymentStatus(7)
    expect(http.get).toHaveBeenCalledWith('/payments/7/status', { params: { compact: true }, headers: undefined })
    await confirmFreeBooking(7)
    expect(http.post).toHaveBeenCalledWith('/payments/7/confirm-free')
  })
})

describe('voucher apply api', () => {
  it('posts the upper-cased code with booking id and gross amount', async () => {
    const { applyVoucher } = await import('@/services/voucher/voucher.api')
    http.post.mockResolvedValue({ data: { finalAmount: 0 } })
    await applyVoucher({ code: ' sale10 ', bookingId: 4, totalAmount: 90000 })
    expect(http.post).toHaveBeenCalledWith('/vouchers/apply', { code: 'SALE10', bookingId: 4, totalAmount: 90000 })
  })
})
