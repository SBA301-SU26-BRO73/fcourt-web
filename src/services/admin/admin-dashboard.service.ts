import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { formatLocalDate } from '@/common/utils/local-date'
import { axiosClient } from '@/services/http/axios-client'

/**
 * The reporting-service has no single "stats" document like the old monolith, so the
 * dashboard is composed from four owner endpoints and mapped into the shape the page reads:
 *
 *  - GET /admin/dashboard/stats                    totals, today revenue, courts, occupancy of today
 *  - GET /admin/dashboard/revenue-chart            revenue per DAY/WEEK/MONTH bucket plus occupancy (ratio 0..1)
 *  - GET /admin/dashboard/analytics/top-courts     top courts of a MONTH/QUARTER/YEAR
 *  - GET /admin/dashboard/analytics/peak-hours     bookings and slots for each start hour 0..23
 *
 * `branchId` is optional on all of them: omitted means every branch of the owner.
 */

// ---- Screen model (what the page renders) -------------------------------------------------

export interface AdminRevenuePoint {
  /** First day of the bucket, yyyy-MM-dd */
  date: string
  revenue: number
  bookings: number
}

export interface AdminPeakHourPoint {
  /** "HH:00" */
  hour: string
  bookedSlots: number
  bookings: number
  peak: boolean
}

export interface AdminTopCourtRow {
  rank: number
  courtId: number | null
  courtName: string
  branchId: number
  branchName: string
  bookingCount: number
  bookedSlots: number
  revenue: number
}

export interface AdminDashboardStats {
  todayRevenue: number
  monthRevenue: number
  yearRevenue: number
  todayBookings: number
  monthBookings: number
  activeBranchCount: number
  activeCourtCount: number
  bookedSlotsLast30Days: number
  availableSlotsLast30Days: number
  /** Percent, 0..100 */
  occupancyRate: number
  revenueChart: AdminRevenuePoint[]
  peakHours: AdminPeakHourPoint[]
  topCourts: AdminTopCourtRow[]
}

// ---- Wire model (reporting-service records) -----------------------------------------------

export interface ApiDashboardStats {
  branchId: number | null
  totalRevenue: number
  todayRevenue: number
  totalBookings: number
  bookingStatusCounts: Record<string, number>
  activeCourts: number
  totalCourts: number
  /** ratio 0..1 */
  occupancyRate: number
  generatedAt: string
}

export interface ApiRevenuePoint {
  periodStart: string
  periodEnd: string
  revenue: number
  bookings: number
  bookedSlots: number
  capacitySlots: number
  occupancyRate: number
}

export interface ApiRevenueChart {
  branchId: number | null
  courtId: number | null
  granularity: 'DAY' | 'WEEK' | 'MONTH'
  from: string
  to: string
  totalRevenue: number
  totalBookings: number
  bookedSlots: number
  capacitySlots: number
  /** ratio 0..1 */
  occupancyRate: number
  occupancyUnit: string
  points: ApiRevenuePoint[]
  generatedAt: string
}

export interface ApiTopCourt {
  rank: number
  courtId: number | null
  courtName: string
  branchId: number
  bookings: number
  bookedSlots: number
  revenue: number
}

export interface ApiTopCourts {
  courts: ApiTopCourt[]
}

export interface ApiHourBucket {
  hour: number
  bookings: number
  slots: number
  peak: boolean
}

export interface ApiPeakHours {
  hours: ApiHourBucket[]
  totalSlots: number
}

export interface OwnedBranchRef {
  id: number
  name: string
  status?: string
}

// ---- Mapping ------------------------------------------------------------------------------

export const REVENUE_DAYS_SHOWN = 14

/** Ratio (0..1) from the API to a percent with one decimal. */
export function toPercent(ratio: number | null | undefined): number {
  return Math.round((ratio ?? 0) * 1000) / 10
}

export function toRevenuePoints(chart: ApiRevenueChart, limit = REVENUE_DAYS_SHOWN): AdminRevenuePoint[] {
  return chart.points
    .slice(-limit)
    .map((point) => ({ date: point.periodStart, revenue: point.revenue, bookings: point.bookings }))
}

/** Bookings of one day taken from a DAY chart (0 when the day is not in it). */
export function bookingsOn(chart: ApiRevenueChart, day: string): number {
  return chart.points.find((point) => point.periodStart === day)?.bookings ?? 0
}

/**
 * The API returns all 24 hours. The page shows the span from the first to the last
 * hour that has any booking, so quiet nights do not squeeze the bars.
 */
export function toPeakHours(peak: ApiPeakHours): AdminPeakHourPoint[] {
  const active = peak.hours.filter((bucket) => bucket.bookings > 0 || bucket.slots > 0)
  if (active.length === 0) return []
  const first = Math.min(...active.map((bucket) => bucket.hour))
  const last = Math.max(...active.map((bucket) => bucket.hour))
  return peak.hours
    .filter((bucket) => bucket.hour >= first && bucket.hour <= last)
    .map((bucket) => ({
      hour: `${String(bucket.hour).padStart(2, '0')}:00`,
      bookedSlots: bucket.slots,
      bookings: bucket.bookings,
      peak: bucket.peak,
    }))
}

/** The top-courts response carries the branch id only, so the name is joined from the owner's branches. */
export function toTopCourts(top: ApiTopCourts, branches: OwnedBranchRef[]): AdminTopCourtRow[] {
  const names = new Map(branches.map((branch) => [branch.id, branch.name]))
  return top.courts.map((court) => ({
    rank: court.rank,
    courtId: court.courtId,
    courtName: court.courtName,
    branchId: court.branchId,
    branchName: names.get(court.branchId) ?? `Chi nhánh #${court.branchId}`,
    bookingCount: court.bookings,
    bookedSlots: court.bookedSlots,
    revenue: court.revenue,
  }))
}

export interface DashboardRanges {
  today: string
  last30From: string
  monthFrom: string
  yearFrom: string
}

export function dashboardRanges(now = new Date()): DashboardRanges {
  const last30 = new Date(now)
  last30.setDate(now.getDate() - 29)
  return {
    today: formatLocalDate(now),
    last30From: formatLocalDate(last30),
    monthFrom: formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    yearFrom: formatLocalDate(new Date(now.getFullYear(), 0, 1)),
  }
}

export function composeDashboard(input: {
  stats: ApiDashboardStats
  last30: ApiRevenueChart
  month: ApiRevenueChart
  year: ApiRevenueChart
  peak: ApiPeakHours
  top: ApiTopCourts
  branches: OwnedBranchRef[]
  branchId?: number
  today: string
}): AdminDashboardStats {
  const { stats, last30, month, year, peak, top, branches, branchId, today } = input
  const scoped = branchId ? branches.filter((branch) => branch.id === branchId) : branches
  return {
    todayRevenue: stats.todayRevenue,
    monthRevenue: month.totalRevenue,
    yearRevenue: year.totalRevenue,
    todayBookings: bookingsOn(last30, today),
    monthBookings: month.totalBookings,
    activeBranchCount: scoped.filter((branch) => branch.status === undefined || branch.status === 'ACTIVE').length,
    activeCourtCount: stats.activeCourts,
    bookedSlotsLast30Days: last30.bookedSlots,
    availableSlotsLast30Days: last30.capacitySlots,
    occupancyRate: toPercent(last30.occupancyRate),
    revenueChart: toRevenuePoints(last30),
    peakHours: toPeakHours(peak),
    topCourts: toTopCourts(top, branches),
  }
}

// ---- Requests -----------------------------------------------------------------------------

/** `GET /admin/branches` is a plain array; a page object is tolerated. */
export async function getOwnedBranches(): Promise<OwnedBranchRef[]> {
  const response = await axiosClient.get<OwnedBranchRef[] | { content?: OwnedBranchRef[] }>(
    API_ENDPOINTS.adminBranches.list,
  )
  const raw = response.data
  const list = Array.isArray(raw) ? raw : (raw?.content ?? [])
  return list.map(({ id, name, status }) => ({ id, name, status }))
}

function revenueChart(params: Record<string, string | number | undefined>) {
  return axiosClient
    .get<ApiRevenueChart>(API_ENDPOINTS.adminDashboard.revenueChart, { params })
    .then((response) => response.data)
}

export async function getAdminDashboardStats(branchId?: number): Promise<AdminDashboardStats> {
  const { today, last30From, monthFrom, yearFrom } = dashboardRanges()
  const scope = branchId ? { branchId } : {}
  const [stats, last30, month, year, peak, top, branches] = await Promise.all([
    axiosClient
      .get<ApiDashboardStats>(API_ENDPOINTS.adminDashboard.stats, { params: scope })
      .then((response) => response.data),
    revenueChart({ ...scope, from: last30From, to: today, granularity: 'DAY' }),
    revenueChart({ ...scope, from: monthFrom, to: today, granularity: 'MONTH' }),
    revenueChart({ ...scope, from: yearFrom, to: today, granularity: 'MONTH' }),
    axiosClient
      .get<ApiPeakHours>(API_ENDPOINTS.adminDashboard.peakHours, { params: { ...scope, period: 'MONTH' } })
      .then((response) => response.data),
    axiosClient
      .get<ApiTopCourts>(API_ENDPOINTS.adminDashboard.topCourts, { params: { ...scope, period: 'YEAR', limit: 5 } })
      .then((response) => response.data),
    getOwnedBranches(),
  ])
  return composeDashboard({ stats, last30, month, year, peak, top, branches, branchId, today })
}

/** Name from `Content-Disposition: attachment; filename="..."`, if the server sent one. */
export function filenameFromDisposition(header: string | undefined, fallback: string): string {
  const match = header?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
  return match ? decodeURIComponent(match[1]) : fallback
}

/** Revenue report of a date range as an .xlsx (or .csv) file: `GET /admin/dashboard/export/revenue`. */
export async function exportRevenueReport(params: {
  fromDate: string
  toDate: string
  branchId?: number
  format?: 'xlsx' | 'csv'
}): Promise<{ blob: Blob; filename: string }> {
  const format = params.format ?? 'xlsx'
  const response = await axiosClient.get<Blob>(API_ENDPOINTS.adminDashboard.exportRevenue, {
    params: {
      fromDate: params.fromDate,
      toDate: params.toDate,
      format,
      ...(params.branchId ? { branchId: params.branchId } : {}),
    },
    responseType: 'blob',
    timeout: 60_000,
  })
  const disposition = response.headers?.['content-disposition'] as string | undefined
  return {
    blob: response.data,
    filename: filenameFromDisposition(disposition, `revenue-${params.fromDate}-${params.toDate}.${format}`),
  }
}
