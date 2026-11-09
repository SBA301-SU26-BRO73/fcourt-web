import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createStaff,
  disableStaff,
  getAllStaffByBranch,
  reactivateStaff,
  updateStaff,
} from '@/services/staff/staff.api'
import type { CreateStaffRequest, UpdateStaffRequest } from '@/types/staff'

const KEY = ['admin-staff'] as const

export function useBranchStaff(branchId: number | null) {
  return useQuery({
    queryKey: [...KEY, branchId],
    queryFn: () => getAllStaffByBranch(branchId as number),
    enabled: branchId !== null,
  })
}

export function useCreateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, key }: { payload: CreateStaffRequest; key: string }) => createStaff(payload, key),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload, key }: { id: number; payload: UpdateStaffRequest; key: string }) =>
      updateStaff(id, payload, key),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useSetStaffActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => (active ? reactivateStaff(id) : disableStaff(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
