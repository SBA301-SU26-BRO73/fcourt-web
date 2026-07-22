import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  approveUser,
  getPendingUsers,
  getUserDetail,
  getUsers,
  lockUser,
  rejectUser,
  unlockUser,
  type UserListParams,
} from '@/services/user/user.service'

const QUERY_KEY = ['users', 'pending']

export function useUsers() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: getPendingUsers })
}

export function useUserDetail(id: number | null) {
  return useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: () => getUserDetail(id as number),
    enabled: id !== null,
  })
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

export function useUserManagement(params: UserListParams) {
  return useQuery({
    queryKey: ['users', 'management', params],
    queryFn: () => getUsers(params),
  })
}

export function useLockUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => lockUser(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUnlockUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => unlockUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
