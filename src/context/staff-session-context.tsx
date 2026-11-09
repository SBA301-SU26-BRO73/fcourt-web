import { useMemo, type PropsWithChildren } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/hooks/use-auth-context'
import { getStaffAssignment } from '@/services/staff/counter.api'
import { getPublicBranch } from '@/services/branch/public-branch.api'
import { StaffSessionContext, type StaffSession } from '@/context/staff-session'

export function StaffSessionProvider({ children }: PropsWithChildren) {
  const { user, isLoggedIn } = useAuth()
  const enabled = isLoggedIn && user?.role === 'STAFF'

  const { data, isLoading } = useQuery({
    queryKey: ['staff-me', user?.id],
    queryFn: getStaffAssignment,
    enabled,
    staleTime: 5 * 60_000,
  })

  // GET /staff/me carries the branch id only; the name comes from the public branch.
  const branchQuery = useQuery({
    queryKey: ['staff-branch-name', data?.branchId],
    queryFn: () => getPublicBranch(data?.branchId as number),
    enabled: data?.branchId != null,
    staleTime: 30 * 60_000,
  })

  const value = useMemo<StaffSession>(
    () => ({
      staffUserId: enabled ? user?.id ?? null : null,
      branchId: data?.branchId ?? null,
      branchName: branchQuery.data?.name ?? null,
      isLoading: enabled && isLoading,
    }),
    [enabled, user, data, branchQuery.data, isLoading],
  )

  return (
    <StaffSessionContext.Provider value={value}>
      {children}
    </StaffSessionContext.Provider>
  )
}
