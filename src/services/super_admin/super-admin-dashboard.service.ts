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
