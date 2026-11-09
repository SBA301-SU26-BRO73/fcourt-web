import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import {
  buildSearchParams,
  getPublicBranchImages,
  getPublicBranchReviews,
  getPublicCourtSlots,
  searchPublicBranches,
} from './public-branch.api'

vi.mock('@/services/http/axios-client', () => ({ axiosClient: { get: vi.fn() } }))

const get = vi.mocked(axiosClient.get)

describe('public branch api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('drops empty filters and keeps 0-based paging', () => {
    expect(
      buildSearchParams({ query: '  tennis ', city: '', district: undefined, courtTypeId: 2, hasAvailableSlotsToday: false, page: 0, size: 6 }),
    ).toEqual({ query: 'tennis', courtTypeId: 2, page: 0, size: 6 })
  })

  it('searches /public/branches with the cleaned params', async () => {
    const page = { content: [], page: 0, size: 6, totalElements: 0, totalPages: 0 }
    get.mockResolvedValue({ data: page })
    await expect(searchPublicBranches({ city: 'Hà Nội', hasAvailableSlotsToday: true })).resolves.toBe(page)
    expect(get).toHaveBeenCalledWith('/public/branches', { params: { city: 'Hà Nội', hasAvailableSlotsToday: true } })
  })

  it('sorts gallery images by sortOrder', async () => {
    get.mockResolvedValue({ data: [{ id: 1, sortOrder: 2 }, { id: 2, sortOrder: 0 }] })
    const images = await getPublicBranchImages(5)
    expect(get).toHaveBeenCalledWith('/public/branches/5/images')
    expect(images.map((image) => image.id)).toEqual([2, 1])
  })

  it('reads reviews with page and size', async () => {
    get.mockResolvedValue({ data: { content: [] } })
    await getPublicBranchReviews(5, 1, 10)
    expect(get).toHaveBeenCalledWith('/public/branches/5/reviews', { params: { page: 1, size: 10 } })
  })

  it('reads the slots of a court for a date', async () => {
    get.mockResolvedValue({ data: [] })
    await getPublicCourtSlots(9, '2026-11-10')
    expect(get).toHaveBeenCalledWith('/public/courts/9/slots', { params: { date: '2026-11-10' } })
  })
})
