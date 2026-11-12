import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosClient } from '@/services/http/axios-client'
import { lookupGuestRefund, requestGuestRefund } from './guest-refund.api'

vi.mock('@/services/http/axios-client', () => ({ axiosClient: { post: vi.fn() }, SKIP_AUTH_HEADER: 'X-Skip-Auth' }))
const post = vi.mocked(axiosClient.post)
beforeEach(() => { vi.clearAllMocks(); post.mockResolvedValue({ data: { id: 25 } }) })

describe('public guest refund API', () => {
  it('normalizes verified identity and skips JWT for lookup', async () => {
    await lookupGuestRefund({ bookingCode: ' fc12345678 ', phone: '+84 912.345-678' })
    expect(post).toHaveBeenCalledWith('/public/refunds/lookup', { bookingCode: 'FC12345678', phone: '+84912345678' }, { headers: { 'X-Skip-Auth': 'true' } })
  })

  it('sends only the public bank fields, omits a blank optional BIN and preserves leading zeros', async () => {
    const payload = { bookingCode: ' fc12345678 ', phone: '0912 345.678', bankName: ' VCB ', accountNumber: ' 00123456789 ', accountHolder: ' NGUYEN VAN A ', bankBin: ' ', amount: 999, bookingId: 9 }
    await expect(requestGuestRefund(payload)).resolves.toEqual({ id: 25 })
    expect(post).toHaveBeenCalledWith('/public/refunds', { bookingCode: 'FC12345678', phone: '0912345678', bankName: 'VCB', accountNumber: '00123456789', accountHolder: 'NGUYEN VAN A' }, { headers: { 'X-Skip-Auth': 'true' } })
    await requestGuestRefund({ ...payload, bankBin: ' 970436 ' })
    expect(post.mock.calls.at(-1)?.[1]).toMatchObject({ bankBin: '970436' })
  })
})
