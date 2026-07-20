import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { ApiResponse } from '@/types/auth'

export interface RevenuePoint {
  month: string
  revenue: number
  subscriptions: number
}

export interface PlanSalesRow {
  planId: number
  planName: string
  soldCount: number
  activeCount: number
  expiredCount: number
  revenue: number
}

export interface BookingRevenuePoint {
  month: string
  revenue: number
  bookings: number
}

export interface BranchRevenueRow {
  branchId: number
  branchName: string
  bookingCount: number
  revenue: number
}

export interface BookingRevenueStats {
  totalRevenue: number
  bookingCount: number
  revenueChart: BookingRevenuePoint[]
  branchRevenue: BranchRevenueRow[]
}

export interface SuperAdminDashboardStats {
  totalSubscriptionRevenue: number
  activeBranchCount: number
  totalCourtCount: number
  activeSubscriptionCount: number
  expiredSubscriptionCount: number
  pendingAdminCount: number
  newSubscriptionsThisMonth: number
  revenueChart: RevenuePoint[]
  planSales: PlanSalesRow[]
}

export interface DashboardBranchRow {
  id: number
  name: string
  adminName: string | null
  adminEmail: string
  address: string
  city: string
  phone: string | null
  openTime: string
  closeTime: string
  slotDurationMinutes: number
  status: string
}

export interface DashboardCourtRow {
  id: number
  name: string
  branchId: number
  branchName: string
  courtTypeName: string
  status: string
  createdAt: string
}

export interface DashboardSubscriptionRow {
  id: number
  adminId: number
  adminName: string | null
  adminEmail: string
  planId: number
  planName: string
  maxCourts: number
  maxBranches: number
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'EXPIRED'
}

export interface SuperAdminDashboardDetails {
  activeBranches: DashboardBranchRow[]
  courts: DashboardCourtRow[]
  subscriptions: DashboardSubscriptionRow[]
}

export async function getSuperAdminDashboardStats(): Promise<SuperAdminDashboardStats> {
  const response = await axiosClient.get<ApiResponse<SuperAdminDashboardStats>>(
    API_ENDPOINTS.superAdminDashboard.stats,
  )

  if (!response.data.data) {
    throw new Error(response.data.message || 'Khong the tai thong ke dashboard.')
  }

  return response.data.data
}

export async function getSuperAdminDashboardDetails(): Promise<SuperAdminDashboardDetails> {
  const response = await axiosClient.get<ApiResponse<SuperAdminDashboardDetails>>(
    API_ENDPOINTS.superAdminDashboard.details,
  )

  if (!response.data.data) {
    throw new Error(response.data.message || 'Khong the tai chi tiet dashboard.')
  }

  return response.data.data
}

export async function getBookingRevenueStats(): Promise<BookingRevenueStats> {
  const response = await axiosClient.get<ApiResponse<BookingRevenueStats>>(
    API_ENDPOINTS.bookings.revenue,
  )

  if (!response.data.data) {
    throw new Error(response.data.message || 'Khong the tai thong ke doanh thu booking.')
  }

  return response.data.data
}
