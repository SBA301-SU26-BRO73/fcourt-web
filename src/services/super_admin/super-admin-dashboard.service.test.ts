import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import { getSuperAdminOverview } from './super-admin-dashboard.service'

vi.mock('@/services/http/axios-client', () => ({ axiosClient: { get: vi.fn() } }))

const http = vi.mocked(axiosClient)

describe('getSuperAdminOverview', () => {
  beforeEach(() => vi.resetAllMocks())

  it('reads the overview for the default 12 months and returns the body as is', async () => {
    const body = {
      owners: { active: 3, pending: 1, rejected: 0, total: 4 },
      branches: { total: 5, active: 4 },
      courts: 12,
      customers: { total: 40, active: 38 },
      gmv: 9_000_000,
      saasRevenue: 1_500_000,
      monthly: [{ month: '2026-11', newAccounts: 2, gmv: 1, saasRevenue: 2 }],
      topOwners: [{ ownerId: 7, ownerName: 'Minh', revenue: 5, branches: 2 }],
      generatedAt: '2026-11-09T00:00:00Z',
    }
    http.get.mockResolvedValue({ data: body })

    await expect(getSuperAdminOverview()).resolves.toEqual(body)
    expect(http.get).toHaveBeenCalledWith('/super-admin/dashboard/overview', { params: { months: 12 } })
  })
})
