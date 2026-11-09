import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'

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

// TODO(F14): stats and details are merged into GET /super-admin/dashboard/overview (accounts stats come
// from /super-admin/stats/accounts, SaaS revenue from /super-admin/stats/saas-revenue); the field
// mapping onto these types is part of F14.
export async function getSuperAdminDashboardStats(): Promise<SuperAdminDashboardStats> {
  const response = await axiosClient.get<SuperAdminDashboardStats>(
    API_ENDPOINTS.superAdminDashboard.overview,
  )
  return response.data
}

export async function getSuperAdminDashboardDetails(): Promise<SuperAdminDashboardDetails> {
  const response = await axiosClient.get<SuperAdminDashboardDetails>(
    API_ENDPOINTS.superAdminDashboard.overview,
  )
  return response.data
}
