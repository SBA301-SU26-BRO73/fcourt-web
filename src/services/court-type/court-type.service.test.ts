import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'
import { deletePlan, getPlans, updatePlan } from '@/services/subscription-plan/subscription-plan.service'

import { createCourtType, deleteCourtType, getCourtTypes } from './court-type.service'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const http = vi.mocked(axiosClient)

describe('court types and plans (subscription-service)', () => {
  beforeEach(() => vi.resetAllMocks())

  it('lists court types with the maximum page size', async () => {
    http.get.mockResolvedValue({ data: { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 } })
    await getCourtTypes()
    expect(http.get).toHaveBeenCalledWith('/court-types', { params: { size: 100 } })
  })

  it('creates a court type and treats DELETE 204 as void', async () => {
    http.post.mockResolvedValue({ data: { id: 1 } })
    await createCourtType({ name: 'Cầu lông', active: true })
    expect(http.post).toHaveBeenCalledWith('/court-types', { name: 'Cầu lông', active: true })

    http.delete.mockResolvedValue({ data: '', status: 204 })
    await expect(deleteCourtType(1)).resolves.toBeUndefined()
    expect(http.delete).toHaveBeenCalledWith('/court-types/1')
  })

  it('lists, updates and deletes plans', async () => {
    http.get.mockResolvedValue({ data: { content: [] } })
    await getPlans()
    expect(http.get).toHaveBeenCalledWith('/subscription-plans', { params: { size: 100 } })

    http.put.mockResolvedValue({ data: { id: 2 } })
    await updatePlan(2, { name: 'Pro', maxBranches: 3, maxCourts: 10, features: [], popular: false })
    expect(http.put).toHaveBeenCalledWith('/subscription-plans/2', expect.objectContaining({ name: 'Pro' }))

    http.delete.mockResolvedValue({ data: '' })
    await expect(deletePlan(2)).resolves.toBeUndefined()
    expect(http.delete).toHaveBeenCalledWith('/subscription-plans/2')
  })
})
