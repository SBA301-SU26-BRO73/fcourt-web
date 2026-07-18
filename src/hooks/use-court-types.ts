import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createCourtType,
  deleteCourtType,
  getCourtTypes,
  updateCourtType,
} from '@/services/court-type/court-type.service'
import type { CourtTypeRequest } from '@/types/admin'

const QUERY_KEY = ['court-types']

export function useCourtTypes() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: getCourtTypes })
}

export function useCreateCourtType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CourtTypeRequest) => createCourtType(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEY }) },
  })
}

export function useUpdateCourtType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CourtTypeRequest }) => updateCourtType(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEY }) },
  })
}

export function useDeleteCourtType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCourtType(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEY }) },
  })
}
