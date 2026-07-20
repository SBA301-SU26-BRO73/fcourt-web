import { useQuery } from '@tanstack/react-query'

import {
  getBookingRevenueStats,
  getSuperAdminDashboardDetails,
  getSuperAdminDashboardStats,
} from '@/services/super_admin/super-admin-dashboard.service'

export function useSuperAdminDashboard() {
  return useQuery({
    queryKey: ['super-admin-dashboard'],
    queryFn: getSuperAdminDashboardStats,
  })
}

export function useBookingRevenue() {
  return useQuery({
    queryKey: ['booking-revenue'],
    queryFn: getBookingRevenueStats,
  })
}

export function useSuperAdminDashboardDetails(enabled: boolean) {
  return useQuery({
    queryKey: ['super-admin-dashboard-details'],
    queryFn: getSuperAdminDashboardDetails,
    enabled,
  })
}
