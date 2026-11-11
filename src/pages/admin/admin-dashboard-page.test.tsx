import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { exportRevenueReport, getAdminDashboardStats, getOwnedBranches } from '@/services/admin/admin-dashboard.service'
import type { AdminDashboardStats } from '@/services/admin/admin-dashboard.service'

import { AdminDashboardPage } from './admin-dashboard-page'

vi.mock('@/services/admin/admin-dashboard.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/admin/admin-dashboard.service')>()),
  getAdminDashboardStats: vi.fn(),
  getOwnedBranches: vi.fn(),
  exportRevenueReport: vi.fn(),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const model: AdminDashboardStats = {
  todayRevenue: 400000,
  monthRevenue: 2000000,
  yearRevenue: 8000000,
  todayBookings: 2,
  monthBookings: 8,
  activeBranchCount: 2,
  activeCourtCount: 6,
  bookedSlotsLast30Days: 30,
  availableSlotsLast30Days: 120,
  occupancyRate: 25,
  revenueChart: [
    { date: '2026-11-08', revenue: 100000, bookings: 1 },
    { date: '2026-11-09', revenue: 400000, bookings: 2 },
  ],
  peakHours: [{ hour: '07:00', bookedSlots: 5, bookings: 3, peak: true }],
  topCourts: [{ rank: 1, courtId: 3, courtName: 'Sân Pickleball 1', branchId: 1, branchName: 'Cơ sở A', bookingCount: 9, bookedSlots: 18, revenue: 900000 }],
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <AdminDashboardPage />
    </QueryClientProvider>,
  )
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('AdminDashboardPage', () => {
  it('renders the KPIs, top courts and occupancy from the mapped model', async () => {
    vi.mocked(getAdminDashboardStats).mockResolvedValue(model)
    vi.mocked(getOwnedBranches).mockResolvedValue([{ id: 1, name: 'Cơ sở A', status: 'ACTIVE' }])
    renderPage()
    expect(await screen.findByText('Sân Pickleball 1')).toBeTruthy()
    expect(screen.getByText('Cơ sở A', { selector: 'div' })).toBeTruthy()
    expect(screen.getAllByText('25%').length).toBeGreaterThan(0)
    expect(screen.getByText('6 sân')).toBeTruthy()
    expect(getAdminDashboardStats).toHaveBeenCalledWith(undefined)
  })

  it('reloads for the chosen branch', async () => {
    vi.mocked(getAdminDashboardStats).mockResolvedValue(model)
    vi.mocked(getOwnedBranches).mockResolvedValue([{ id: 1, name: 'Cơ sở A', status: 'ACTIVE' }])
    renderPage()
    await screen.findByText('Sân Pickleball 1')
    await screen.findByRole('option', { name: 'Cơ sở A' })
    fireEvent.change(screen.getByLabelText('Chọn chi nhánh'), { target: { value: '1' } })
    await waitFor(() => expect(getAdminDashboardStats).toHaveBeenCalledWith(1))
  })

  it('shows the error panel and retries', async () => {
    vi.mocked(getAdminDashboardStats).mockRejectedValue(new Error('boom'))
    vi.mocked(getOwnedBranches).mockResolvedValue([])
    renderPage()
    expect(await screen.findByText('Không thể tải dữ liệu Bảng điều khiển Admin')).toBeTruthy()
    expect(screen.getByText('boom')).toBeTruthy()
  })

  it('exports the revenue report', async () => {
    vi.mocked(getAdminDashboardStats).mockResolvedValue(model)
    vi.mocked(getOwnedBranches).mockResolvedValue([])
    vi.mocked(exportRevenueReport).mockResolvedValue({ blob: new Blob(['x']), filename: 'r.xlsx' })
    URL.createObjectURL = vi.fn(() => 'blob:x')
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    URL.revokeObjectURL = vi.fn()
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: /Xuất Excel/ }))
    await waitFor(() => expect(exportRevenueReport).toHaveBeenCalled())
    expect(vi.mocked(exportRevenueReport).mock.calls[0][0]).toMatchObject({ branchId: undefined })
  })
})
