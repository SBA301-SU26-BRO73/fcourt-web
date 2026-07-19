import { useMemo, type PropsWithChildren } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/hooks/use-auth-context'
import { getCurrentStaff } from '@/services/staff/staff.api'
import { StaffSessionContext, type StaffSession } from '@/context/staff-session'

export function StaffSessionProvider({ children }: PropsWithChildren) {
  const { user, isLoggedIn } = useAuth()
  const enabled = isLoggedIn && user?.role === 'STAFF'

  const { data, isLoading } = useQuery({
    queryKey: ['staff-me', user?.id],
    queryFn: getCurrentStaff,
    enabled,
    staleTime: 5 * 60_000,
  })

  const value = useMemo<StaffSession>(
    () => ({
      staffUserId: enabled ? user?.id ?? null : null,
      branchId: data?.branchId ?? null,
      branchName: data?.branchName ?? null,
      isLoading: enabled && isLoading,
    }),
    [enabled, user, data, isLoading],
  )

  return (
    <StaffSessionContext.Provider value={value}>
      {children}
    </StaffSessionContext.Provider>
  )
}
