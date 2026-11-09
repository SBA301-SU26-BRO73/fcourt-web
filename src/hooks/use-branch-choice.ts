import { useState } from 'react'

import { useOwnerBranches } from '@/hooks/use-admin-vouchers'

/**
 * Payments, refunds and the ledger are scoped to one branch on the server, so these
 * screens always work on a branch: the owner's pick, else the first branch.
 */
export function useBranchChoice() {
  const branchesQuery = useOwnerBranches()
  const [picked, setPicked] = useState<number | undefined>(undefined)
  const branches = branchesQuery.data ?? []
  const branchId = picked ?? branches[0]?.id
  return { branches, branchId, setBranchId: setPicked, isLoading: branchesQuery.isLoading }
}
