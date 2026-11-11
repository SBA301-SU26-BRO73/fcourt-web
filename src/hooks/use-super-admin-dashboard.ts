import { useQuery } from '@tanstack/react-query'

import { getSuperAdminDashboardDetails, getSuperAdminOverview } from '@/services/super_admin/super-admin-dashboard.service'

export function useSuperAdminDashboard() {
  return useQuery({
    queryKey: ['super-admin-dashboard'],
    queryFn: () => getSuperAdminOverview(),
  })
}

/** Detail lists are fetched lazily, only while a detail modal is open. */
export function useSuperAdminDashboardDetails(enabled: boolean) {
  return useQuery({
    queryKey: ['super-admin-dashboard', 'details'],
    queryFn: () => getSuperAdminDashboardDetails(),
    enabled,
  })
}
