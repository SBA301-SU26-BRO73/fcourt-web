import { useQuery } from '@tanstack/react-query'

import { getStaffBranch, getStaffCourts } from '@/services/staff/counter.api'
import { useStaffSession } from '@/context/staff-session'

/**
 * The courts (columns) of the staff's branch and the branch status. Cached longer than the
 * schedule itself since it rarely changes during a shift.
 */
export function useBranchGrid() {
  const { branchId } = useStaffSession()
  const enabled = branchId != null

  const courtsQuery = useQuery({
    queryKey: ['branch-courts', branchId],
    queryFn: () => getStaffCourts(branchId as number),
    enabled,
    staleTime: 5 * 60_000,
  })

  const branchQuery = useQuery({
    queryKey: ['staff-branch', branchId],
    queryFn: () => getStaffBranch(branchId as number),
    enabled,
    staleTime: 5 * 60_000,
  })

  return {
    courts: courtsQuery.data,
    branch: branchQuery.data,
    isLoading: courtsQuery.isLoading,
    isError: courtsQuery.isError,
  }
}
