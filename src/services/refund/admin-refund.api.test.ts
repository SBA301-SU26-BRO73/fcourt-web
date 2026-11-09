import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import { approveRefund, completeRefund, getPendingRefunds, rejectRefund } from './refund.api'

vi.mock('@/services/http/axios-client', () => ({ axiosClient: { get: vi.fn(), put: vi.fn() } }))

const http = vi.mocked(axiosClient)

describe('admin refund api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists pending refunds of a branch as a bare array', async () => {
    http.get.mockResolvedValue({ data: [{ id: 1 }] })
    await expect(getPendingRefunds({ branchId: 3, page: 2, size: 10 })).resolves.toEqual([{ id: 1 }])
    expect(http.get).toHaveBeenCalledWith('/admin/refunds/pending', { params: { branchId: 3, page: 2, size: 10 } })
  })

  it('approves, rejects with a reason and completes with a multipart file', async () => {
    http.put.mockResolvedValue({ data: { id: 5 } })
    await approveRefund(5)
    expect(http.put).toHaveBeenCalledWith('/admin/refunds/5/approve')
    await rejectRefund(5, ' Không hợp lệ ')
    expect(http.put).toHaveBeenCalledWith('/admin/refunds/5/reject', { reason: 'Không hợp lệ' })

    const proofImage = new File(['x'], 'proof.png', { type: 'image/png' })
    await completeRefund({ refundId: 5, proofImage })
    const [url, body, config] = http.put.mock.calls.at(-1) as [string, FormData, { headers: Record<string, string> }]
    expect(url).toBe('/admin/refunds/5/complete')
    expect(body.get('file')).toBe(proofImage)
    expect(config.headers['Content-Type']).toBe('multipart/form-data')
  })
})
