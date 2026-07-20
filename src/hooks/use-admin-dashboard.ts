import { useQuery } from '@tanstack/react-query'

import { getAdminDashboardStats } from '@/services/admin/admin-dashboard.service'

export function useAdminDashboard(enabled = true) {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getAdminDashboardStats,
    enabled,
  })
}
