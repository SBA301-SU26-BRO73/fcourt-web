import { useMutation, useQuery } from '@tanstack/react-query'

import {
  exportRevenueReport,
  getAdminDashboardStats,
  getOwnedBranches,
} from '@/services/admin/admin-dashboard.service'

/** `branchId` undefined = every branch of the owner. */
export function useAdminDashboard(enabled = true, branchId?: number) {
  return useQuery({
    queryKey: ['admin-dashboard', branchId ?? 'all'],
    queryFn: () => getAdminDashboardStats(branchId),
    enabled,
  })
}

export function useDashboardBranches(enabled = true) {
  return useQuery({ queryKey: ['admin-dashboard', 'branches'], queryFn: getOwnedBranches, enabled })
}

export function useExportRevenue() {
  return useMutation({ mutationFn: exportRevenueReport })
}
