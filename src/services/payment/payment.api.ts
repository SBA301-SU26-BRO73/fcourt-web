import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { pageFromApi } from '@/common/utils/api-page'
import { axiosClient } from '@/services/http/axios-client'
import type { LedgerApiPage, LedgerParams, PendingPayment } from '@/types/payment'

/** The server returns 50 pending payments per `offset`. */
const PENDING_BATCH = 50
const MAX_BATCHES = 10

/** `GET /admin/payments/pending?branchId&offset`: a bare array, read batch by batch. */
export async function getPendingPayments(branchId: number): Promise<PendingPayment[]> {
  const all: PendingPayment[] = []
  for (let batch = 0; batch < MAX_BATCHES; batch += 1) {
    const response = await axiosClient.get<PendingPayment[]>(API_ENDPOINTS.payments.adminPending, {
      params: { branchId, offset: batch * PENDING_BATCH },
    })
    all.push(...response.data)
    if (response.data.length < PENDING_BATCH) break
  }
  return all
}

/**
 * `GET /admin/payments/transactions`: the unified ledger (booking payments, refunds as negative
 * amounts, walk-in cash) with a summary for the whole filter.
 */
export async function getLedger(params: LedgerParams) {
  const response = await axiosClient.get<LedgerApiPage>(API_ENDPOINTS.payments.adminTransactions, {
    params: {
      branchId: params.branchId,
      transactionType: params.transactionType,
      status: params.status,
      page: params.page,
      size: params.size,
      ...(params.fromDate ? { fromDate: params.fromDate } : {}),
      ...(params.toDate ? { toDate: params.toDate } : {}),
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    },
  })
  return { ...pageFromApi(response.data), summary: response.data.summary }
}
