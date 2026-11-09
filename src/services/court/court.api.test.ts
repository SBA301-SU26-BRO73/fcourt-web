import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import {
  changeCourtStatus,
  createCourt,
  getCourtDetail,
  getCourts,
  getCourtsByBranch,
  toCourt,
  updateCourt,
} from './court.api'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const http = vi.mocked(axiosClient)

const dto = (id: number, branchId: number, name: string, courtTypeId = 1) => ({
  id,
  branchId,
  name,
  courtTypeId,
  description: null,
  imageUrl: null,
  defaultPricePerHour: 120000,
  status: 'ACTIVE' as const,
  createdAt: '',
  updatedAt: '',
})

const branches = [
  { id: 1, name: 'Cơ sở A', slotDurationMinutes: 60 },
  { id: 2, name: 'Cơ sở B', slotDurationMinutes: 30 },
]

function mockGet() {
  http.get.mockImplementation((async (url: string) => {
    if (url === '/admin/branches') return { data: branches }
    if (url === '/admin/branches/1') return { data: branches[0] }
    if (url === '/admin/branches/2') return { data: branches[1] }
    if (url === '/admin/branches/1/courts') return { data: [dto(10, 1, 'Sân 2'), dto(11, 1, 'Sân 1', 9)] }
    if (url === '/admin/branches/2/courts') return { data: [dto(20, 2, 'Sân 3')] }
    if (url === '/admin/courts/20') return { data: dto(20, 2, 'Sân 3') }
    if (url === '/court-types') return { data: { content: [{ id: 1, name: 'Cầu lông' }, { id: 9, name: 'Tennis' }] } }
    throw new Error(`unexpected GET ${url}`)
  }) as never)
}

describe('court api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('falls back to readable names when the branch or type is unknown', () => {
    const court = toCourt(dto(1, 5, 'X', 3), undefined, new Map())
    expect(court).toMatchObject({ branchName: 'Chi nhánh #5', courtTypeName: 'Loại sân #3', slotDurationMinutes: 30 })
  })

  it('lists the courts of one branch with names', async () => {
    mockGet()
    const courts = await getCourtsByBranch(1)
    expect(courts.map((court) => [court.name, court.branchName, court.courtTypeName, court.slotDurationMinutes])).toEqual([
      ['Sân 2', 'Cơ sở A', 'Cầu lông', 60],
      ['Sân 1', 'Cơ sở A', 'Tennis', 60],
    ])
  })

  it('merges the courts of every branch, sorted and paged on the client', async () => {
    mockGet()
    const page = await getCourts({ page: 0, size: 2, sortField: 'name', sortDirection: 'asc' })
    expect(page.content.map((court) => court.name)).toEqual(['Sân 1', 'Sân 2'])
    expect(page).toMatchObject({ totalElements: 3, totalPages: 2 })
  })

  it('reads a court detail together with its branch', async () => {
    mockGet()
    await expect(getCourtDetail(20)).resolves.toMatchObject({ branchName: 'Cơ sở B', courtTypeName: 'Cầu lông' })
  })

  it('creates under the branch path and updates by court id', async () => {
    http.post.mockResolvedValue({ data: dto(1, 1, 'N') })
    http.put.mockResolvedValue({ data: dto(1, 1, 'N') })
    const body = { name: 'N', courtTypeId: 1, defaultPricePerHour: 90000, status: 'ACTIVE' as const }
    await createCourt(1, body)
    await updateCourt(1, body)
    expect(http.post).toHaveBeenCalledWith('/admin/branches/1/courts', body)
    expect(http.put).toHaveBeenCalledWith('/admin/courts/1', body)
  })

  it('changes status with PATCH { status }', async () => {
    http.patch.mockResolvedValue({ data: dto(1, 1, 'N') })
    await changeCourtStatus(1, 'MAINTENANCE')
    expect(http.patch).toHaveBeenCalledWith('/admin/courts/1/status', { status: 'MAINTENANCE' })
  })
})
