import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import {
  bookingsOn,
  composeDashboard,
  dashboardRanges,
  exportRevenueReport,
  filenameFromDisposition,
  getAdminDashboardStats,
  toPeakHours,
  toPercent,
  toRevenuePoints,
  toTopCourts,
  type ApiDashboardStats,
  type ApiPeakHours,
  type ApiRevenueChart,
} from './admin-dashboard.service'

vi.mock('@/services/http/axios-client', () => ({ axiosClient: { get: vi.fn() } }))

const http = vi.mocked(axiosClient)

function chart(overrides: Partial<ApiRevenueChart> = {}): ApiRevenueChart {
  return {
    branchId: null,
    courtId: null,
    granularity: 'DAY',
    from: '2026-10-11',
    to: '2026-11-09',
    totalRevenue: 3_000_000,
    totalBookings: 12,
    bookedSlots: 30,
    capacitySlots: 120,
    occupancyRate: 0.25,
    occupancyUnit: 'RATIO',
    points: [],
    generatedAt: '',
    ...overrides,
  }
}

const stats: ApiDashboardStats = {
  branchId: null,
  totalRevenue: 9_000_000,
  todayRevenue: 400_000,
  totalBookings: 40,
  bookingStatusCounts: { CONFIRMED: 30, PENDING: 5, CANCELLED: 5 },
  activeCourts: 6,
  totalCourts: 8,
  occupancyRate: 0.1,
  generatedAt: '',
}

describe('dashboard mapping', () => {
  it('turns a ratio into a percent with one decimal', () => {
    expect(toPercent(0.2534)).toBe(25.3)
    expect(toPercent(1)).toBe(100)
    expect(toPercent(null)).toBe(0)
  })

  it('keeps the last 14 buckets as { date, revenue, bookings }', () => {
    const points = Array.from({ length: 30 }, (_, index) => ({
      periodStart: `2026-10-${String(index + 1).padStart(2, '0')}`,
      periodEnd: '',
      revenue: index * 1000,
      bookings: index,
      bookedSlots: 0,
      capacitySlots: 0,
      occupancyRate: 0,
    }))
    const mapped = toRevenuePoints(chart({ points }))
    expect(mapped).toHaveLength(14)
    expect(mapped[13]).toEqual({ date: '2026-10-30', revenue: 29000, bookings: 29 })
  })

  it('reads the bookings of one day from a DAY chart', () => {
    const c = chart({ points: [{ periodStart: '2026-11-09', periodEnd: '2026-11-09', revenue: 1, bookings: 4, bookedSlots: 4, capacitySlots: 10, occupancyRate: 0.4 }] })
    expect(bookingsOn(c, '2026-11-09')).toBe(4)
    expect(bookingsOn(c, '2026-11-08')).toBe(0)
  })

  it('trims quiet hours and labels the rest', () => {
    const hours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      bookings: hour === 7 || hour === 9 ? 3 : 0,
      slots: hour === 7 || hour === 9 ? 5 : 0,
      peak: hour === 7,
    }))
    const mapped = toPeakHours({ hours, totalSlots: 10 } as ApiPeakHours)
    expect(mapped.map((point) => point.hour)).toEqual(['07:00', '08:00', '09:00'])
    expect(mapped[0]).toEqual({ hour: '07:00', bookedSlots: 5, bookings: 3, peak: true })
    expect(toPeakHours({ hours: hours.map((bucket) => ({ ...bucket, bookings: 0, slots: 0 })), totalSlots: 0 })).toEqual([])
  })

  it('joins the branch name into the top courts', () => {
    const rows = toTopCourts(
      { courts: [{ rank: 1, courtId: 3, courtName: 'Sân 1', branchId: 2, bookings: 9, bookedSlots: 18, revenue: 900000 }, { rank: 2, courtId: null, courtName: 'Sân X', branchId: 99, bookings: 1, bookedSlots: 1, revenue: 1 }] },
      [{ id: 2, name: 'Cơ sở B' }],
    )
    expect(rows[0]).toMatchObject({ branchName: 'Cơ sở B', bookingCount: 9, bookedSlots: 18, rank: 1 })
    expect(rows[1].branchName).toBe('Chi nhánh #99')
  })

  it('composes the page model from the four reporting answers', () => {
    const model = composeDashboard({
      stats,
      last30: chart({ points: [{ periodStart: '2026-11-09', periodEnd: '2026-11-09', revenue: 400000, bookings: 2, bookedSlots: 4, capacitySlots: 10, occupancyRate: 0.4 }] }),
      month: chart({ totalRevenue: 2_000_000, totalBookings: 8 }),
      year: chart({ totalRevenue: 8_000_000 }),
      peak: { hours: [], totalSlots: 0 },
      top: { courts: [] },
      branches: [{ id: 1, name: 'A', status: 'ACTIVE' }, { id: 2, name: 'B', status: 'INACTIVE' }],
      today: '2026-11-09',
    })
    expect(model).toMatchObject({
      todayRevenue: 400_000,
      todayBookings: 2,
      monthRevenue: 2_000_000,
      monthBookings: 8,
      yearRevenue: 8_000_000,
      activeBranchCount: 1,
      activeCourtCount: 6,
      bookedSlotsLast30Days: 30,
      availableSlotsLast30Days: 120,
      occupancyRate: 25,
    })
  })

  it('counts only the selected branch when one is chosen', () => {
    const model = composeDashboard({
      stats,
      last30: chart(),
      month: chart(),
      year: chart(),
      peak: { hours: [], totalSlots: 0 },
      top: { courts: [] },
      branches: [{ id: 1, name: 'A', status: 'ACTIVE' }, { id: 2, name: 'B', status: 'ACTIVE' }],
      branchId: 2,
      today: '2026-11-09',
    })
    expect(model.activeBranchCount).toBe(1)
  })

  it('computes the date ranges in local time', () => {
    expect(dashboardRanges(new Date(2026, 10, 9))).toEqual({
      today: '2026-11-09',
      last30From: '2026-10-11',
      monthFrom: '2026-11-01',
      yearFrom: '2026-01-01',
    })
  })
})

describe('dashboard requests', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls the five owner endpoints and the branch list, scoped by branchId', async () => {
    http.get.mockImplementation((async (url: string) => {
      if (url === '/admin/dashboard/stats') return { data: stats }
      if (url === '/admin/dashboard/revenue-chart') return { data: chart() }
      if (url === '/admin/dashboard/analytics/peak-hours') return { data: { hours: [], totalSlots: 0 } }
      if (url === '/admin/dashboard/analytics/top-courts') return { data: { courts: [] } }
      if (url === '/admin/branches') return { data: [{ id: 5, name: 'A', status: 'ACTIVE' }] }
      throw new Error(`unexpected ${url}`)
    }) as never)
    const model = await getAdminDashboardStats(5)
    expect(model.activeBranchCount).toBe(1)
    const calls = http.get.mock.calls.map(([url, config]) => [url, (config as { params?: Record<string, unknown> } | undefined)?.params])
    expect(calls).toContainEqual(['/admin/dashboard/stats', { branchId: 5 }])
    expect(calls).toContainEqual(['/admin/dashboard/analytics/top-courts', { branchId: 5, period: 'YEAR', limit: 5 }])
    expect(calls).toContainEqual(['/admin/dashboard/analytics/peak-hours', { branchId: 5, period: 'MONTH' }])
    const chartCalls = calls.filter(([url]) => url === '/admin/dashboard/revenue-chart')
    expect(chartCalls.map(([, params]) => (params as { granularity: string }).granularity)).toEqual(['DAY', 'MONTH', 'MONTH'])
  })

  it('exports the revenue report as a blob with the server filename', async () => {
    const blob = new Blob(['x'])
    http.get.mockResolvedValue({ data: blob, headers: { 'content-disposition': 'attachment; filename="revenue_20261109.xlsx"' } })
    const file = await exportRevenueReport({ fromDate: '2026-10-11', toDate: '2026-11-09', branchId: 2 })
    expect(http.get).toHaveBeenCalledWith('/admin/dashboard/export/revenue', expect.objectContaining({
      params: { fromDate: '2026-10-11', toDate: '2026-11-09', format: 'xlsx', branchId: 2 },
      responseType: 'blob',
    }))
    expect(file).toEqual({ blob, filename: 'revenue_20261109.xlsx' })
  })

  it('falls back to a generated filename', () => {
    expect(filenameFromDisposition(undefined, 'a.xlsx')).toBe('a.xlsx')
  })
})
