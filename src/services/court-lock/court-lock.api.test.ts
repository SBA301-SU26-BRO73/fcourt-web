import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import { getCourtLocks, lockBranchCourts, lockCourt, unlockCourt, unlockGroup } from './court-lock.api'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

const http = vi.mocked(axiosClient)
const window = { startAt: '2026-11-10T08:00:00', endAt: '2026-11-10T10:00:00', reason: 'Bảo trì' }

describe('court lock api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists the locks of a branch and sends only the filters that are set', async () => {
    http.get.mockResolvedValue({ data: [] })
    await getCourtLocks({ branchId: 3 })
    await getCourtLocks({ branchId: 3, courtId: 8, from: '2026-11-01T00:00:00', to: '2026-11-30T00:00:00' })
    expect(http.get).toHaveBeenNthCalledWith(1, '/admin/courts/lock-slots', { params: { branchId: 3 } })
    expect(http.get).toHaveBeenNthCalledWith(2, '/admin/courts/lock-slots', {
      params: { branchId: 3, courtId: 8, from: '2026-11-01T00:00:00', to: '2026-11-30T00:00:00' },
    })
  })

  it('locks and unlocks a single court', async () => {
    http.post.mockResolvedValue({ data: { id: 5 } })
    http.delete.mockResolvedValue({})
    await lockCourt({ courtId: 8, ...window })
    await unlockCourt(5)
    expect(http.post).toHaveBeenCalledWith('/admin/courts/lock-slots', { courtId: 8, ...window })
    expect(http.delete).toHaveBeenCalledWith('/admin/courts/lock-slots/5')
  })

  it('puts a branch out of service and releases it by group id', async () => {
    http.post.mockResolvedValue({ data: { groupId: 'g1', totalLocks: 2 } })
    http.delete.mockResolvedValue({})
    await lockBranchCourts({ branchId: 3, allCourts: true, ...window })
    await unlockGroup('0b5e0a64-0000-0000-0000-000000000001')
    expect(http.post).toHaveBeenCalledWith('/admin/courts/out-of-service', { branchId: 3, allCourts: true, ...window })
    expect(http.delete).toHaveBeenCalledWith('/admin/courts/out-of-service/0b5e0a64-0000-0000-0000-000000000001')
  })
})
