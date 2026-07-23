import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { ApiResponse } from '@/types/auth'
import type { SpringPage } from '@/types/court'
import type { RefundRequestResponse, RefundRequestStatus } from '@/types/booking'

function requireData<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'The server returned no data.')
  }
  return response.data
}

export async function getRefundRequests(params: {
  status?: RefundRequestStatus
  page?: number
  size?: number
}) {
  const { data } = await axiosClient.get<ApiResponse<SpringPage<RefundRequestResponse>>>(
    API_ENDPOINTS.refundRequests.list,
    {
      params: {
        status: params.status ?? 'PENDING',
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: 'createdAt,desc',
      },
    },
  )
  return requireData(data)
}

export async function confirmRefundRequest(params: { refundRequestId: number; proofImage: File }) {
  const formData = new FormData()
  formData.append('proofImage', params.proofImage)

  const { data } = await axiosClient.post<ApiResponse<RefundRequestResponse>>(
    API_ENDPOINTS.refundRequests.confirm(params.refundRequestId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return requireData(data)
}
