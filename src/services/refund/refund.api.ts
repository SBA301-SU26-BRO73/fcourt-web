import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { AdminRefund } from '@/types/admin-booking'

/** `GET /admin/refunds/pending?branchId&page&size`: PENDING and APPROVED refunds as a bare array. */
export async function getPendingRefunds(params: { branchId: number; page?: number; size?: number }) {
  const { data } = await axiosClient.get<AdminRefund[]>(API_ENDPOINTS.refunds.pending, {
    params: { branchId: params.branchId, page: params.page ?? 0, size: params.size ?? 20 },
  })
  return data
}

export async function approveRefund(refundId: number) {
  const { data } = await axiosClient.put<AdminRefund>(API_ENDPOINTS.refunds.approve(refundId))
  return data
}

/** The reason (1-500 characters) is required by the server. */
export async function rejectRefund(refundId: number, reason: string) {
  const { data } = await axiosClient.put<AdminRefund>(API_ENDPOINTS.refunds.reject(refundId), {
    reason: reason.trim(),
  })
  return data
}

/** Marks the transfer as done; the multipart part is named `file`. */
export async function completeRefund(params: { refundId: number; proofImage: File }) {
  const formData = new FormData()
  formData.append('file', params.proofImage)
  const { data } = await axiosClient.put<AdminRefund>(API_ENDPOINTS.refunds.complete(params.refundId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
