import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'
import type { FullCourtPackage } from '@/types/admin-booking'

import { cancelFullCourt, createFullCourt, listFullCourt, quoteFullCourt, relockFullCourt } from './full-court.service'

vi.mock('@/services/http/axios-client', () => ({ axiosClient: { get: vi.fn(), post: vi.fn() } }))

const http = vi.mocked(axiosClient)
const window = { branchId: 3, courtIds: [1, 2], date: '2026-11-20', startTime: '08:00', endTime: '12:00' }
const pkg = { packageId: 'p-1', state: 'COMMITTED' } as FullCourtPackage

describe('full-court service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('quotes a window without sending contact data', async () => {
    http.post.mockResolvedValue({ data: { total: 1 } })
    await quoteFullCourt({ ...window, extra: 1 } as typeof window)
    expect(http.post).toHaveBeenCalledWith('/admin/bookings/full-court/quote', window)
  })

  it('creates with an Idempotency-Key and flags a 202 as pending', async () => {
    http.post.mockResolvedValue({ status: 202, data: pkg })
    const result = await createFullCourt({ ...window, contactName: ' An ', contactPhone: ' 0901234567 ' }, 'key-1')
    expect(http.post).toHaveBeenCalledWith(
      '/admin/bookings/full-court',
      { ...window, contactName: 'An', contactPhone: '0901234567' },
      { headers: { 'Idempotency-Key': 'key-1' } },
    )
    expect(result).toEqual({ pkg, pending: true })
  })

  it('lists with the state filter, cancels with a reason and relocks', async () => {
    http.get.mockResolvedValue({ data: [pkg] })
    await listFullCourt({ state: 'LOCK_LOST', page: 0, size: 10 })
    expect(http.get).toHaveBeenCalledWith('/admin/bookings/full-court', { params: { page: 0, size: 10, state: 'LOCK_LOST' } })

    http.post.mockResolvedValue({ status: 200, data: pkg })
    await expect(cancelFullCourt('p-1', ' hỏng ')).resolves.toEqual({ pkg, pending: false })
    expect(http.post).toHaveBeenCalledWith('/admin/bookings/full-court/p-1/cancel', { reason: 'hỏng' })
    await relockFullCourt('p-1')
    expect(http.post).toHaveBeenCalledWith('/admin/bookings/full-court/p-1/relock')
  })
})
