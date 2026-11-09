import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'

export interface AdminRevenuePoint {
  date: string
  revenue: number
  bookings: number
}

export interface AdminPeakHourPoint {
  hour: string
  bookedSlots: number
  revenue: number
}

export interface AdminTopCourtRow {
  courtId: number
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
  occupancyRate: number
  revenueChart: AdminRevenuePoint[]
  peakHours: AdminPeakHourPoint[]
  topCourts: AdminTopCourtRow[]
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const response = await axiosClient.get<AdminDashboardStats>(
    API_ENDPOINTS.adminDashboard.stats,
  )

  // TODO(F12): reporting-service fields were not compared against AdminDashboardStats yet.
  return response.data
}
