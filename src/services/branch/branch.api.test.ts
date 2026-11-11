import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'
import type { Branch } from '@/types/branch'

import {
  branchToRequest,
  createBranch,
  deleteBranchImage,
  getBranchImages,
  getBranches,
  setBranchStatus,
  updateBranch,
  uploadBranchImages,
} from './branch.api'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const http = vi.mocked(axiosClient)

function branch(overrides: Partial<Branch> = {}): Branch {
  return {
    id: 7,
    adminId: 1,
    name: 'Cơ sở A',
    address: '1 Láng Hạ',
    ward: 'Láng Hạ',
    district: 'Đống Đa',
    city: 'Hà Nội',
    latitude: 21.01,
    longitude: 105.8,
    phone: '0901234567',
    openTime: '06:00',
    closeTime: '22:00',
    slotDurationMinutes: 60,
    bankName: 'Vietcombank',
    bankBin: '970436',
    bankAccountNumber: '0123456789',
    bankAccountName: 'NGUYEN VAN A',
    status: 'ACTIVE',
    courtCount: 3,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('admin branch api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sorts and pages the plain array returned by GET /admin/branches', async () => {
    http.get.mockResolvedValue({ data: [branch({ id: 1, name: 'B' }), branch({ id: 2, name: 'A' }), branch({ id: 3, name: 'C' })] })
    const page = await getBranches({ page: 0, size: 2, sortField: 'name', sortDirection: 'asc' })
    expect(http.get).toHaveBeenCalledWith('/admin/branches')
    expect(page.content.map((item) => item.name)).toEqual(['A', 'B'])
    expect(page).toMatchObject({ totalElements: 3, totalPages: 2, last: false })
  })

  it('posts the branch body without adminId or bankQrImageUrl', async () => {
    http.post.mockResolvedValue({ data: branch() })
    const body = branchToRequest(branch())
    await createBranch(body)
    expect(http.post).toHaveBeenCalledWith('/admin/branches', body)
    expect(body).not.toHaveProperty('adminId')
    expect(body).toMatchObject({ bankBin: '970436', openTime: '06:00', slotDurationMinutes: 60 })
  })

  it('replaces a branch with PUT', async () => {
    http.put.mockResolvedValue({ data: branch() })
    const body = branchToRequest(branch())
    await updateBranch(7, body)
    expect(http.put).toHaveBeenCalledWith('/admin/branches/7', body)
  })

  it('deactivates a branch with a full PUT carrying the new status', async () => {
    http.put.mockResolvedValue({ data: branch({ status: 'INACTIVE' }) })
    await setBranchStatus(branch({ openTime: '06:00:00' }), 'INACTIVE')
    expect(http.put).toHaveBeenCalledWith(
      '/admin/branches/7',
      expect.objectContaining({ status: 'INACTIVE', name: 'Cơ sở A', openTime: '06:00', latitude: 21.01 }),
    )
  })

  it('reads the gallery ordered by sortOrder', async () => {
    http.get.mockResolvedValue({ data: [{ id: 1, sortOrder: 1 }, { id: 2, sortOrder: 0 }] })
    const images = await getBranchImages(7)
    expect(http.get).toHaveBeenCalledWith('/admin/branches/7/images')
    expect(images.map((image) => image.id)).toEqual([2, 1])
  })

  it('uploads gallery images as repeated multipart "files" parts', async () => {
    http.post.mockResolvedValue({ data: [] })
    const a = new File(['a'], 'a.png', { type: 'image/png' })
    const b = new File(['b'], 'b.webp', { type: 'image/webp' })
    await uploadBranchImages(7, [a, b])
    const [url, form] = http.post.mock.calls[0] as unknown as [string, FormData]
    expect(url).toBe('/admin/branches/7/images')
    expect(form.getAll('files')).toHaveLength(2)
  })

  it('deletes an image through the non-nested route', async () => {
    http.delete.mockResolvedValue({})
    await deleteBranchImage(55)
    expect(http.delete).toHaveBeenCalledWith('/admin/branches/images/55')
  })
})
