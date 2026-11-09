import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { SpringPage } from '@/types/branch'
import type { Payment, PaymentListParams } from '@/types/payment'

export async function getPayments(params: PaymentListParams) {
  const response = await axiosClient.get<SpringPage<Payment>>(
    // TODO(F9): GET /admin/payments/transactions has no hasVoucher filter; adds transactionType,
    // fromDate, toDate, status, search and returns { items, page, size, total }.
    API_ENDPOINTS.payments.adminTransactions,
    {
      params: {
        page: params.page,
        size: params.size,
        branchId: params.branchId,
        hasVoucher: params.hasVoucher,
      },
    },
  )
  return response.data
}
