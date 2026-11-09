import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import {
  checkoutBooking,
  createPosOrder,
  createWalkIn,
  getCheckoutPreview,
  getPosOrder,
  getPosOrders,
  getPosProducts,
  getStaffAssignment,
  getStaffBranch,
  getStaffCourts,
  getTodaySchedule,
  getWeekSchedule,
  manualCheckIn,
  previewCheckIn,
  replayOfflineCheckIn,
  verifyCheckIn,
} from './counter.api'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const http = vi.mocked(axiosClient)
const key = { headers: { 'Idempotency-Key': 'key-1' } }

describe('counter api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('reads the assignment, the branch and its courts', async () => {
    http.get.mockResolvedValue({ data: { id: 1 } })
    await getStaffAssignment()
    await getStaffBranch(7)
    await getStaffCourts(7)
    expect(http.get.mock.calls.map((c) => c[0])).toEqual(['/staff/me', '/staff/branches/7', '/staff/branches/7/courts'])
  })

  it('reads today and the week schedule', async () => {
    http.get.mockResolvedValue({ data: { courts: [] } })
    await getTodaySchedule()
    await getWeekSchedule('2026-11-09', '2026-11-15')
    expect(http.get).toHaveBeenNthCalledWith(1, '/staff/schedule/today')
    expect(http.get).toHaveBeenNthCalledWith(2, '/staff/schedule', {
      params: { startDate: '2026-11-09', endDate: '2026-11-15' },
    })
  })

  it('previews without a key and confirms with one (QR verify, manual)', async () => {
    http.post.mockResolvedValue({ data: {} })
    await previewCheckIn('  CODE ')
    await verifyCheckIn(' CODE ', 'key-1')
    await manualCheckIn('CODE', 'key-1')
    expect(http.post).toHaveBeenNthCalledWith(1, '/staff/check-in/preview', { checkInCode: 'CODE' })
    expect(http.post).toHaveBeenNthCalledWith(2, '/staff/check-in/verify', { checkInCode: 'CODE' }, key)
    expect(http.post).toHaveBeenNthCalledWith(3, '/staff/check-in/manual', { checkInCode: 'CODE' }, key)
  })

  it('replays an offline check-in with the time it happened', async () => {
    http.post.mockResolvedValue({ data: {} })
    await replayOfflineCheckIn('permit', '2026-11-09T10:00:00Z', 'key-1')
    expect(http.post).toHaveBeenCalledWith(
      '/staff/check-in/offline',
      { permit: 'permit', occurredAt: '2026-11-09T10:00:00Z' },
      key,
    )
  })

  it('creates a walk-in with slot ids and an Idempotency-Key', async () => {
    http.post.mockResolvedValue({ data: {} })
    const body = { courtId: 3, date: '2026-11-09', slotIds: [11, 12], guestPhone: '0912345678' }
    await createWalkIn(body, 'key-1')
    expect(http.post).toHaveBeenCalledWith('/staff/walk-in', body, key)
  })

  it('previews then completes a checkout with the expected amounts', async () => {
    http.get.mockResolvedValue({ data: {} })
    http.put.mockResolvedValue({ data: {} })
    await getCheckoutPreview(9)
    await checkoutBooking(9, { expectedSurcharge: 0, expectedTotal: 50000 }, 'key-1')
    expect(http.get).toHaveBeenCalledWith('/staff/bookings/9/checkout-preview')
    expect(http.put).toHaveBeenCalledWith(
      '/staff/bookings/9/checkout',
      { expectedSurcharge: 0, expectedTotal: 50000 },
      key,
    )
  })

  it('lists products with limit/offset and only the filters that are set', async () => {
    http.get.mockResolvedValue({ data: [] })
    await getPosProducts({ query: 'nước' })
    await getPosProducts()
    expect(http.get).toHaveBeenNthCalledWith(1, '/staff/pos/products', {
      params: { query: 'nước', limit: 100, offset: 0 },
    })
    expect(http.get).toHaveBeenNthCalledWith(2, '/staff/pos/products', { params: { limit: 100, offset: 0 } })
  })

  it('creates, reads and lists POS orders', async () => {
    http.post.mockResolvedValue({ data: { id: 5 } })
    http.get.mockResolvedValue({ data: [] })
    const body = { paymentMethod: 'CASH' as const, items: [{ productId: 1, quantity: 2 }] }
    await createPosOrder(body, 'key-1')
    await getPosOrder(5)
    await getPosOrders(20, 40)
    expect(http.post).toHaveBeenCalledWith('/staff/pos/orders', body, key)
    expect(http.get).toHaveBeenNthCalledWith(1, '/staff/pos/orders/5')
    expect(http.get).toHaveBeenNthCalledWith(2, '/staff/pos/orders', { params: { limit: 20, offset: 40 } })
  })
})
