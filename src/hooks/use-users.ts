import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { approveUser, getPendingUsers, rejectUser } from '@/services/user/user.service'

const QUERY_KEY = ['users', 'pending']

export function useUsers() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: getPendingUsers })
}

export function useApproveUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => approveUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEY }) },
  })
}

export function useRejectUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => rejectUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEY }) },
  })
}
