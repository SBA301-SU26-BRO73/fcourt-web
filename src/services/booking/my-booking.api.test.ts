import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'
import { getRefundState, requestRefund } from '@/services/refund/customer-refund.api'
import { createReview, uploadReviewImages, validateReviewImages } from '@/services/review/review.api'

import {
  cancelMyBooking,
  getCancellationPolicy,
  getMyBooking,
  getMyBookings,
  getMyTransactions,
  getTicket,
} from './my-booking.api'

vi.mock('@/services/http/axios-client', () => ({ axiosClient: { get: vi.fn(), post: vi.fn() } }))

const http = vi.mocked(axiosClient)

beforeEach(() => vi.clearAllMocks())

describe('booking history', () => {
  it('sends the filter and maps the envelope to a spring-like page', async () => {
    http.get.mockResolvedValue({ data: { items: [{ id: 1 }, { id: 2 }], page: 1, size: 2, total: 5 } })
    const page = await getMyBookings('UPCOMING', 1, 2)
    expect(http.get).toHaveBeenCalledWith('/bookings/my', { params: { status: 'UPCOMING', page: 1, size: 2 } })
    expect(page.content).toHaveLength(2)
    expect(page).toMatchObject({ number: 1, totalElements: 5, totalPages: 3, first: false, last: false })
  })

  it('reads one booking and its cancellation policy', async () => {
    http.get.mockResolvedValueOnce({ data: { id: 7 } }).mockResolvedValueOnce({ data: { allowed: true } })
    expect(await getMyBooking(7)).toEqual({ id: 7 })
    expect(await getCancellationPolicy(7)).toEqual({ allowed: true })
    expect(http.get).toHaveBeenNthCalledWith(1, '/bookings/7')
    expect(http.get).toHaveBeenNthCalledWith(2, '/bookings/7/cancellation-policy')
  })

  it('maps the transaction history page', async () => {
    http.get.mockResolvedValue({ data: { items: [], page: 0, size: 10, total: 0 } })
    const page = await getMyTransactions()
    expect(http.get).toHaveBeenCalledWith('/payments/my-transactions', { params: { page: 0, size: 10 } })
    expect(page.empty).toBe(true)
  })

  it('reads the ticket by booking id', async () => {
    http.get.mockResolvedValue({ data: { bookingId: 3, checkInCode: 'ABC123' } })
    expect((await getTicket(3)).checkInCode).toBe('ABC123')
    expect(http.get).toHaveBeenCalledWith('/payments/3/ticket')
  })
})

describe('cancel', () => {
  it('posts the trimmed reason only', async () => {
    http.post.mockResolvedValue({ data: { id: 7, status: 'CANCELLED' } })
    await cancelMyBooking(7, '  bận việc  ')
    expect(http.post).toHaveBeenCalledWith('/bookings/7/cancel', { reason: 'bận việc' })
  })

  it('rejects an empty or too long reason without calling the API', async () => {
    await expect(cancelMyBooking(7, '   ')).rejects.toThrow()
    await expect(cancelMyBooking(7, 'x'.repeat(501))).rejects.toThrow()
    expect(http.post).not.toHaveBeenCalled()
  })
})

describe('refunds', () => {
  it('loads the refund state of a booking', async () => {
    http.get.mockResolvedValue({ data: { bookingId: 7, amount: 100000, eligible: true, request: null } })
    expect((await getRefundState(7)).eligible).toBe(true)
    expect(http.get).toHaveBeenCalledWith('/refunds/booking/7')
  })

  it('sends bank details without an amount', async () => {
    http.post.mockResolvedValue({ data: { id: 1 } })
    await requestRefund({
      bookingId: 7,
      bankName: 'Vietcombank',
      bankBin: '970436',
      bankAccountNumber: ' 0123456789 ',
      bankAccountName: ' NGUYEN VAN A ',
      reason: ' hủy ',
    })
    expect(http.post).toHaveBeenCalledWith('/refunds/request', {
      bookingId: 7,
      bankName: 'Vietcombank',
      bankBin: '970436',
      bankAccountNumber: '0123456789',
      bankAccountName: 'NGUYEN VAN A',
      reason: 'hủy',
    })
  })
})

describe('reviews', () => {
  it('uploads photos as repeated "files" parts and returns the urls', async () => {
    http.post.mockResolvedValue({ data: { urls: ['https://cdn/a.jpg', 'https://cdn/b.jpg'] } })
    const files = [new File(['a'], 'a.jpg', { type: 'image/jpeg' }), new File(['b'], 'b.jpg', { type: 'image/jpeg' })]
    const urls = await uploadReviewImages(files)
    const form = http.post.mock.calls[0][1] as FormData
    expect(http.post.mock.calls[0][0]).toBe('/reviews/images')
    expect(form.getAll('files')).toHaveLength(2)
    expect(urls).toEqual(['https://cdn/a.jpg', 'https://cdn/b.jpg'])
  })

  it('skips the upload call when there are no photos', async () => {
    expect(await uploadReviewImages([])).toEqual([])
    expect(http.post).not.toHaveBeenCalled()
  })

  it('creates a review with a trimmed comment', async () => {
    http.post.mockResolvedValue({ data: { id: 9 } })
    await createReview({ bookingId: 7, rating: 5, comment: '  rất tốt ' })
    expect(http.post).toHaveBeenCalledWith('/reviews', { bookingId: 7, rating: 5, comment: 'rất tốt', imageUrls: [] })
  })

  it('validates photo count, type and size', () => {
    const ok = { type: 'image/png', size: 1000 }
    expect(validateReviewImages([ok])).toBeNull()
    expect(validateReviewImages(Array(6).fill(ok))).toBeTruthy()
    expect(validateReviewImages([{ type: 'image/gif', size: 1 }])).toBeTruthy()
    expect(validateReviewImages([{ type: 'image/png', size: 6 * 1024 * 1024 }])).toBeTruthy()
  })
})
