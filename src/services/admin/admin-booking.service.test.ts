import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import { approvePayment, cancelAdminBooking, getAdminBookings, rejectPayment } from './booking.service'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const http = vi.mocked(axiosClient)

describe('admin booking service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists bookings with server paging and filters, mapped to the page shape', async () => {
    http.get.mockResolvedValue({ data: { items: [{ id: 1 }], page: 0, size: 10, total: 12 } })
    const page = await getAdminBookings({ branchId: 3, status: 'AWAITING_CONFIRMATION', search: ' BK-1 ', page: 0, size: 10 })
    expect(http.get).toHaveBeenCalledWith('/admin/bookings', {
      params: { page: 0, size: 10, sortBy: 'createdAt', direction: 'DESC', branchId: 3, status: 'AWAITING_CONFIRMATION', search: 'BK-1' },
    })
    expect(page).toMatchObject({ totalElements: 12, totalPages: 2, number: 0 })
  })

  it('omits empty filters', async () => {
    http.get.mockResolvedValue({ data: { items: [], page: 0, size: 10, total: 0 } })
    await getAdminBookings({ search: '  ', page: 0, size: 10 })
    expect(http.get).toHaveBeenCalledWith('/admin/bookings', {
      params: { page: 0, size: 10, sortBy: 'createdAt', direction: 'DESC' },
    })
  })

  it('cancels with a reason and an Idempotency-Key', async () => {
    http.post.mockResolvedValue({ data: {} })
    await cancelAdminBooking(7, ' Sân hỏng ', 'key-1')
    expect(http.post).toHaveBeenCalledWith('/admin/bookings/7/cancel', { reason: 'Sân hỏng' }, { headers: { 'Idempotency-Key': 'key-1' } })
  })

  it('confirms a payment with PUT and rejects it with a reason', async () => {
    http.put.mockResolvedValue({ data: {} })
    await approvePayment(9)
    expect(http.put).toHaveBeenCalledWith('/admin/payments/9/confirm')
    await rejectPayment(9, 'Sai số tiền ')
    expect(http.put).toHaveBeenCalledWith('/admin/payments/9/reject', { reason: 'Sai số tiền' })
  })
})
