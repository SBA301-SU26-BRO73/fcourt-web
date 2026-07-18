import { useQuery } from '@tanstack/react-query'

import { getCourtsByBranch } from '@/services/court/court.api'
import { getBranchDetail } from '@/services/branch/branch.api'
import { useStaffSession } from '@/context/staff-session'

/**
 * Static skeleton for the schedule grid: the branch's courts (columns) and its
 * open/close hours (row range). Cached longer than the schedule itself since it
 * rarely changes during a shift.
 */
export function useBranchGrid() {
  const { branchId } = useStaffSession()
  const enabled = branchId != null

  const courtsQuery = useQuery({
    queryKey: ['branch-courts', branchId],
    queryFn: () => getCourtsByBranch(branchId as number),
    enabled,
    staleTime: 5 * 60_000,
  })

  const branchQuery = useQuery({
    queryKey: ['branch-detail', branchId],
    queryFn: () => getBranchDetail(branchId as number),
    enabled,
    staleTime: 5 * 60_000,
  })

  return {
    courts: courtsQuery.data,
    branch: branchQuery.data,
    isLoading: courtsQuery.isLoading || branchQuery.isLoading,
    isError: courtsQuery.isError || branchQuery.isError,
  }
}
