import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import { getPendingUsers, getUsers, lockUser, rejectUser, toUserManagementPage, unlockUser } from './user.service'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: { get: vi.fn(), put: vi.fn() },
}))

const http = vi.mocked(axiosClient)

const item = {
  id: 5,
  email: 'a@b.vn',
  fullName: 'An',
  phone: null,
  role: 'CUSTOMER' as const,
  status: 'ACTIVE' as const,
  createdAt: '2026-11-01T00:00:00Z',
}

describe('user.service (super admin)', () => {
  beforeEach(() => vi.resetAllMocks())

  it('lists users on /super-admin/users and maps the UserPage body', async () => {
    http.get.mockResolvedValue({ data: { items: [item], page: 1, size: 10, total: 25 } })

    const page = await getUsers({ role: 'CUSTOMER', status: '', query: '  an  ', page: 1, size: 10 })

    expect(http.get).toHaveBeenCalledWith('/super-admin/users', {
      params: { role: 'CUSTOMER', status: undefined, query: 'an', page: 1, size: 10 },
    })
    expect(page).toEqual({ content: [item], size: 10, number: 1, totalElements: 25, totalPages: 3 })
  })

  it('reports zero pages for an empty result', () => {
    expect(toUserManagementPage({ items: [], page: 0, size: 10, total: 0 }).totalPages).toBe(0)
  })

  it('wraps the bare pending owners array in a page', async () => {
    http.get.mockResolvedValue({ data: [item] })
    const page = await getPendingUsers()
    expect(http.get).toHaveBeenCalledWith('/super-admin/court-admins/pending')
    expect(page).toMatchObject({ content: [item], totalElements: 1, totalPages: 1 })
  })

  it('locks with a reason and unlocks without a body through toggle-status', async () => {
    http.put.mockResolvedValue({ data: { id: 5, status: 'LOCKED' } })
    await lockUser(5, 'spam')
    expect(http.put).toHaveBeenCalledWith('/super-admin/users/5/toggle-status', { reason: 'spam' })

    http.put.mockResolvedValue({ data: { id: 5, status: 'ACTIVE' } })
    await expect(unlockUser(5)).resolves.toEqual({ id: 5, status: 'ACTIVE' })
    expect(http.put).toHaveBeenLastCalledWith('/super-admin/users/5/toggle-status')
  })

  it('sends a reason when rejecting an owner', async () => {
    http.put.mockResolvedValue({ data: item })
    await rejectUser(5, 'thiếu giấy tờ')
    expect(http.put).toHaveBeenCalledWith('/super-admin/court-admins/5/reject', { reason: 'thiếu giấy tờ' })
  })
})
