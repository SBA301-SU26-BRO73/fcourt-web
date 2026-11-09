import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'
import type { StaffResponse } from '@/types/staff'

import {
  createStaff,
  disableStaff,
  getAllStaffByBranch,
  getStaffByBranch,
  reactivateStaff,
  updateStaff,
} from './staff.api'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const http = vi.mocked(axiosClient)

function staff(id: number): StaffResponse {
  return {
    id,
    userId: id + 100,
    branchId: 3,
    email: `s${id}@bro73.app`,
    fullName: `Staff ${id}`,
    phone: '0901234567',
    active: true,
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    shifts: [],
  }
}

const headers = { headers: { 'Idempotency-Key': 'k' } }

describe('staff api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists a branch with limit and offset', async () => {
    http.get.mockResolvedValue({ data: [staff(1)] })
    const rows = await getStaffByBranch({ branchId: 3, limit: 50, offset: 100 })
    expect(http.get).toHaveBeenCalledWith('/admin/staff', { params: { branchId: 3, limit: 50, offset: 100 } })
    expect(rows).toHaveLength(1)
  })

  it('keeps reading until a short page to get every staff of a branch', async () => {
    const full = Array.from({ length: 100 }, (_, i) => staff(i))
    http.get.mockResolvedValueOnce({ data: full }).mockResolvedValueOnce({ data: [staff(200)] })
    const all = await getAllStaffByBranch(3)
    expect(all).toHaveLength(101)
    expect(http.get).toHaveBeenCalledTimes(2)
    expect(http.get).toHaveBeenLastCalledWith('/admin/staff', { params: { branchId: 3, limit: 100, offset: 100 } })
  })

  it('creates and updates with an Idempotency-Key', async () => {
    http.post.mockResolvedValue({ data: staff(1) })
    http.put.mockResolvedValue({ data: staff(1) })
    const create = { branchId: 3, email: 'a@b.co', password: 'x'.repeat(12), fullName: 'A', phone: '0901234567', shifts: [] }
    await createStaff(create, 'k')
    expect(http.post).toHaveBeenCalledWith('/admin/staff', create, headers)
    const update = { fullName: 'A', phone: '0901234567', shifts: [] }
    await updateStaff(1, update, 'k')
    expect(http.put).toHaveBeenCalledWith('/admin/staff/1', update, headers)
  })

  it('disables with DELETE and reactivates with POST', async () => {
    http.delete.mockResolvedValue({ data: { ...staff(1), active: false } })
    http.post.mockResolvedValue({ data: staff(1) })
    const disabled = await disableStaff(1, 'k')
    expect(http.delete).toHaveBeenCalledWith('/admin/staff/1', headers)
    expect(disabled.active).toBe(false)
    await reactivateStaff(1, 'k')
    expect(http.post).toHaveBeenCalledWith('/admin/staff/1/reactivate', undefined, headers)
  })
})
