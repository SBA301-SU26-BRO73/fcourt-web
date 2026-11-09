import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'
import type { Voucher } from '@/types/voucher'

import {
  createVoucher,
  deleteVoucher,
  getOwnerBranches,
  getVoucherUsages,
  getVouchers,
  removeVoucher,
  setVoucherStatus,
  updateVoucher,
  validateVoucher,
  voucherToRequest,
} from './voucher.api'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const http = vi.mocked(axiosClient)

const voucher: Voucher = {
  id: 5,
  code: 'SUMMER20',
  branchId: 3,
  discountType: 'PERCENTAGE',
  discountValue: 20,
  maxDiscountAmount: 50000,
  minOrderAmount: 100000,
  startDate: '2026-11-01T00:00:00Z',
  endDate: '2026-12-01T00:00:00Z',
  usageLimit: 100,
  usedCount: 4,
  status: 'ACTIVE',
}

describe('voucher api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('maps { items, page, size, total } into the page shape the screen reads', async () => {
    http.get.mockResolvedValue({ data: { items: [voucher], page: 1, size: 10, total: 25 } })
    const page = await getVouchers({ page: 1, size: 10 })
    expect(http.get).toHaveBeenCalledWith('/admin/vouchers', { params: { page: 1, size: 10 } })
    expect(page).toMatchObject({
      content: [voucher],
      number: 1,
      size: 10,
      totalElements: 25,
      totalPages: 3,
      first: false,
      last: false,
    })
  })

  it('filters by branch only when one is given and flags the last page', async () => {
    http.get.mockResolvedValue({ data: { items: [], page: 0, size: 20, total: 0 } })
    const page = await getVouchers({ page: 0, size: 20, branchId: 3 })
    expect(http.get).toHaveBeenCalledWith('/admin/vouchers', { params: { page: 0, size: 20, branchId: 3 } })
    expect(page).toMatchObject({ totalPages: 0, first: true, last: true, empty: true })
  })

  it('sends the full request on create and update', async () => {
    http.post.mockResolvedValue({ data: voucher })
    http.put.mockResolvedValue({ data: voucher })
    const body = voucherToRequest(voucher)
    await createVoucher(body)
    await updateVoucher(5, body)
    expect(http.post).toHaveBeenCalledWith('/admin/vouchers', body)
    expect(http.put).toHaveBeenCalledWith('/admin/vouchers/5', body)
    expect(body).toMatchObject({ code: 'SUMMER20', branchId: 3, endDate: voucher.endDate, status: 'ACTIVE' })
  })

  it('disables a voucher by PUT with status EXPIRED and keeps every other field', async () => {
    http.put.mockResolvedValue({ data: { ...voucher, status: 'EXPIRED' } })
    await setVoucherStatus(voucher, 'EXPIRED')
    expect(http.put).toHaveBeenCalledWith('/admin/vouchers/5', { ...voucherToRequest(voucher), status: 'EXPIRED' })
  })

  it('deletes by id', async () => {
    http.delete.mockResolvedValue({})
    await deleteVoucher(5)
    expect(http.delete).toHaveBeenCalledWith('/admin/vouchers/5')
  })

  it('reads usages with the phone filter and the total discount', async () => {
    http.get.mockResolvedValue({
      data: { items: [{ id: 'u1' }], page: 0, size: 10, total: 1, totalDiscountAmount: 40000 },
    })
    const page = await getVoucherUsages(5, { page: 0, size: 10, phone: ' 0901 ' })
    expect(http.get).toHaveBeenCalledWith('/admin/vouchers/5/usages', { params: { page: 0, size: 10, phone: '0901' } })
    expect(page).toMatchObject({ totalDiscountAmount: 40000, totalElements: 1 })
  })

  it('omits an empty phone filter', async () => {
    http.get.mockResolvedValue({ data: { items: [], page: 0, size: 10, total: 0, totalDiscountAmount: 0 } })
    await getVoucherUsages(5, { page: 0, size: 10, phone: '  ' })
    expect(http.get).toHaveBeenCalledWith('/admin/vouchers/5/usages', { params: { page: 0, size: 10 } })
  })

  it('reads the owner branches from a plain array', async () => {
    http.get.mockResolvedValue({ data: [{ id: 1, name: 'A', city: 'x' }] })
    await expect(getOwnerBranches()).resolves.toEqual([{ id: 1, name: 'A' }])
    expect(http.get).toHaveBeenCalledWith('/admin/branches')
  })

  it('previews a voucher with the code upper-cased', async () => {
    const data = { valid: true, reason: 'VALID', bookingId: 123, originalAmount: 100000, discountAmount: 20000, finalAmount: 80000 }
    http.post.mockResolvedValue({ data })
    const result = await validateVoucher({ code: ' save20 ', bookingId: 123 })
    expect(http.post).toHaveBeenCalledWith('/vouchers/validate', { code: 'SAVE20', bookingId: 123 })
    expect(result).toEqual(data)
  })

  it('removes the voucher of a booking with DELETE', async () => {
    const data = { bookingId: 123, removed: true, totalAmount: 100000 }
    http.delete.mockResolvedValue({ data })
    const result = await removeVoucher(123)
    expect(http.delete).toHaveBeenCalledWith('/vouchers/apply/123')
    expect(result).toEqual(data)
  })
})
