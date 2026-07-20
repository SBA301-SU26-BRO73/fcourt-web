import { axiosClient } from '@/services/http/axios-client'
import type { ApiResponse, SpringPage } from '@/types/branch'
import type { Payment, PaymentListParams } from '@/types/payment'

function requireData<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'The server returned no data.')
  }
  return response.data
}

export async function getPayments(params: PaymentListParams) {
  const response = await axiosClient.get<ApiResponse<SpringPage<Payment>>>(
    '/payments',
    {
      params: {
        page: params.page,
        size: params.size,
        branchId: params.branchId,
        hasVoucher: params.hasVoucher,
      },
    },
  )
  return requireData(response.data)
}
