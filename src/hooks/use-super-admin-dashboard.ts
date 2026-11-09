import { useQuery } from '@tanstack/react-query'

import { getSuperAdminOverview } from '@/services/super_admin/super-admin-dashboard.service'

export function useSuperAdminDashboard() {
  return useQuery({
    queryKey: ['super-admin-dashboard'],
    queryFn: () => getSuperAdminOverview(),
  })
}
