import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'

/**
 * reporting-service GET /super-admin/dashboard/overview. The old monolith had separate stats and
 * details documents; the overview carries only aggregates (owner/customer counts from auth-service,
 * branches and courts from facility-service, SaaS revenue from subscription-service, GMV from reports).
 * Money fields are VND numbers.
 */
export interface OverviewOwners {
  active: number
  pending: number
  rejected: number
  total: number
}

export interface OverviewMonthlyPoint {
  /** yyyy-MM */
  month: string
  newAccounts: number
  /** Booking revenue recognized in the month. */
  gmv: number
  /** PAID plan purchases of the month. */
  saasRevenue: number
}

export interface OverviewTopOwner {
  ownerId: number
  ownerName: string
  revenue: number
  branches: number
}

export interface SuperAdminOverview {
  owners: OverviewOwners
  branches: { total: number; active: number }
  courts: number
  customers: { total: number; active: number }
  gmv: number
  saasRevenue: number
  monthly: OverviewMonthlyPoint[]
  topOwners: OverviewTopOwner[]
  generatedAt: string
}

export const OVERVIEW_DEFAULT_MONTHS = 12

export async function getSuperAdminOverview(months = OVERVIEW_DEFAULT_MONTHS): Promise<SuperAdminOverview> {
  const response = await axiosClient.get<SuperAdminOverview>(API_ENDPOINTS.superAdminDashboard.overview, {
    params: { months },
  })
  return response.data
}

export interface DashboardBranchRow {
  id: number
  name: string
  ownerId: number
  ownerName: string
  ownerEmail: string | null
  address: string
  ward: string
  district: string
  city: string
  phone: string | null
  status: string
  courtCount: number
}

export interface DashboardCourtRow {
  id: number
  name: string
  branchId: number
  branchName: string
  courtTypeId: number | null
  courtTypeName: string | null
  status: string
}

export interface DashboardSubscriptionRow {
  id: number
  ownerId: number
  ownerName: string
  ownerEmail: string | null
  planId: number
  planName: string
  maxCourts: number
  maxBranches: number
  /** yyyy-MM-dd */
  startDate: string
  /** yyyy-MM-dd */
  endDate: string
  status: 'ACTIVE' | 'EXPIRED'
  starter: boolean
  price: number | null
}

export interface PlanSalesRow {
  planId: number
  planName: string
  sold: number
  active: number
  expired: number
  revenue: number
}

export interface SuperAdminDashboardDetails {
  activeBranches: DashboardBranchRow[]
  courts: DashboardCourtRow[]
  subscriptions: DashboardSubscriptionRow[]
  planSales: PlanSalesRow[]
  activeSubscriptionCount: number
  expiredSubscriptionCount: number
  generatedAt: string
}

export async function getSuperAdminDashboardDetails(): Promise<SuperAdminDashboardDetails> {
  const response = await axiosClient.get<SuperAdminDashboardDetails>(API_ENDPOINTS.superAdminDashboard.details)
  return response.data
}
