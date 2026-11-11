import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createVoucher,
  deleteVoucher,
  getOwnerBranches,
  getVoucherUsages,
  getVouchers,
  setVoucherStatus,
  updateVoucher,
} from '@/services/voucher/voucher.api'
import type { Voucher, VoucherListParams, VoucherRequest, VoucherStatus, VoucherUsageParams } from '@/types/voucher'

const KEY = ['vouchers'] as const

export function useVouchers(params: VoucherListParams, enabled = true) {
  return useQuery({
    queryKey: [...KEY, 'list', params],
    queryFn: () => getVouchers(params),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useVoucherUsages(voucherId: number | null, params: VoucherUsageParams) {
  return useQuery({
    queryKey: [...KEY, 'usages', voucherId, params],
    queryFn: () => getVoucherUsages(voucherId as number, params),
    placeholderData: keepPreviousData,
    enabled: voucherId !== null,
  })
}

export function useOwnerBranches() {
  return useQuery({ queryKey: ['branches', 'owner-options'], queryFn: getOwnerBranches })
}

export function useSaveVoucher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: VoucherRequest }) =>
      id ? updateVoucher(id, payload) : createVoucher(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useSetVoucherStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ voucher, status }: { voucher: Voucher; status: VoucherStatus }) => setVoucherStatus(voucher, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteVoucher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (voucherId: number) => deleteVoucher(voucherId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
