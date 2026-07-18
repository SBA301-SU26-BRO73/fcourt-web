import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createPlan,
  deletePlan,
  getPlans,
  updatePlan,
} from '@/services/subscription-plan/subscription-plan.service'
import type { PlanRequest } from '@/types/admin'

const QUERY_KEY = ['plans']

export function usePlans() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: getPlans })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PlanRequest) => createPlan(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEY }) },
  })
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PlanRequest }) => updatePlan(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEY }) },
  })
}

export function useDeletePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deletePlan(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEY }) },
  })
}
