import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import { getLedger, getPendingPayments } from './payment.api'

vi.mock('@/services/http/axios-client', () => ({ axiosClient: { get: vi.fn() } }))

const http = vi.mocked(axiosClient)
const payments = (count: number) => Array.from({ length: count }, (_, id) => ({ id }))

describe('admin payment api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('reads pending payments 50 at a time until a short batch', async () => {
    http.get.mockResolvedValueOnce({ data: payments(50) }).mockResolvedValueOnce({ data: payments(3) })
    const all = await getPendingPayments(4)
    expect(all).toHaveLength(53)
    expect(http.get).toHaveBeenNthCalledWith(1, '/admin/payments/pending', { params: { branchId: 4, offset: 0 } })
    expect(http.get).toHaveBeenNthCalledWith(2, '/admin/payments/pending', { params: { branchId: 4, offset: 50 } })
  })

  it('reads the unified ledger with filters and keeps the summary', async () => {
    const summary = { received: 100, refunded: 20, netRevenue: 80, pending: 0, rejectedCount: 1 }
    http.get.mockResolvedValue({ data: { items: [], page: 1, size: 20, total: 45, summary } })
    const page = await getLedger({
      branchId: 2,
      transactionType: 'REFUND',
      status: 'SUCCESS',
      fromDate: '2026-11-01',
      toDate: '2026-11-09',
      search: ' RF ',
      page: 1,
      size: 20,
    })
    expect(http.get).toHaveBeenCalledWith('/admin/payments/transactions', {
      params: {
        branchId: 2,
        transactionType: 'REFUND',
        status: 'SUCCESS',
        page: 1,
        size: 20,
        fromDate: '2026-11-01',
        toDate: '2026-11-09',
        search: 'RF',
      },
    })
    expect(page).toMatchObject({ totalElements: 45, totalPages: 3, summary })
  })
})
