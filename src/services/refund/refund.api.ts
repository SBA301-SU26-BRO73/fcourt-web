import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { SpringPage } from '@/types/court'
import type { RefundRequestResponse, RefundRequestStatus } from '@/types/booking'

export async function getRefundRequests(params: {
  status?: RefundRequestStatus
  page?: number
  size?: number
}) {
  const { data } = await axiosClient.get<SpringPage<RefundRequestResponse>>(
    // TODO(F9): GET /admin/refunds/pending returns a bare array (no status filter, no paging fields).
    API_ENDPOINTS.refunds.pending,
    {
      params: {
        status: params.status ?? 'PENDING',
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: 'createdAt,desc',
      },
    },
  )
  return data
}

export async function confirmRefundRequest(params: { refundRequestId: number; proofImage: File }) {
  const formData = new FormData()
  formData.append('file', params.proofImage)

  const { data } = await axiosClient.put<RefundRequestResponse>(
    // TODO(F9): refunds are now approve, reject or complete; complete takes a multipart part "file".
    API_ENDPOINTS.refunds.complete(params.refundRequestId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return data
}
