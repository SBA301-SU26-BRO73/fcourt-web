import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/common/utils/api-error'
import { lookupGuestRefund, requestGuestRefund } from '@/services/refund/guest-refund.api'
import type { Refund, RefundState } from '@/types/my-booking'
import { GuestRefundSection, guestRefundErrorMessage, validateGuestRefund } from './GuestRefundSection'

vi.mock('@/services/refund/guest-refund.api', () => ({ lookupGuestRefund: vi.fn(), requestGuestRefund: vi.fn() }))
const identity = { bookingCode: 'FC12345678', phone: '0912345678' }
const refund: Refund = {
  id: 25, bookingId: 42, amount: 100000, status: 'PENDING', bankName: 'VCB', bankBin: null,
  bankAccountNumber: '00123456789', bankAccountName: 'NGUYEN VAN A', bankInfoMissing: false,
  customerPhone: identity.phone, reason: null, adminNote: null, transferProofUrl: null,
  createdAt: '2026-11-12T01:00:00Z', updatedAt: '2026-11-12T01:00:00Z',
}
const state: RefundState = { bookingId: 42, amount: 100000, eligible: true, request: null }
const form = () => screen.getByRole('form', { name: 'Thông tin nhận tiền hoàn' })
const save = () => screen.getByRole('button', { name: 'Lưu thông tin hoàn tiền' }) as HTMLButtonElement

function open() {
  const client = new QueryClient()
  render(<QueryClientProvider client={client}><GuestRefundSection identity={identity} amount={100000} /></QueryClientProvider>)
  return client
}

beforeEach(() => {
  vi.mocked(lookupGuestRefund).mockResolvedValue(state)
  vi.mocked(requestGuestRefund).mockResolvedValue(refund)
})
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.restoreAllMocks() })

describe('guest bank details', () => {
  it.each([null, { ...refund, bankName: null, bankAccountNumber: null, bankAccountName: null, bankInfoMissing: true }])('accepts a request before or after automatic creation: %s', async (request) => {
    vi.mocked(lookupGuestRefund).mockResolvedValue({ ...state, request })
    open()
    await screen.findByRole('form', { name: 'Thông tin nhận tiền hoàn' })
    fireEvent.change(screen.getByLabelText('Tên ngân hàng'), { target: { value: 'VCB' } })
    fireEvent.change(screen.getByLabelText('Số tài khoản'), { target: { value: '00123456789' } })
    fireEvent.change(screen.getByLabelText('Tên chủ tài khoản'), { target: { value: 'NGUYEN VAN A' } })
    fireEvent.submit(form())
    expect(await screen.findByRole('status')).toHaveProperty('textContent', 'Đã lưu thông tin nhận tiền hoàn.')
    expect(requestGuestRefund).toHaveBeenCalledWith({ ...identity, bankName: 'VCB', accountNumber: '00123456789', accountHolder: 'NGUYEN VAN A', bankBin: '' })
    expect(lookupGuestRefund).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/Trạng thái: Đã gửi yêu cầu, chờ chủ sân duyệt/)).toBeTruthy()
  })

  it('prefills and corrects pending bank fields', async () => {
    vi.mocked(lookupGuestRefund).mockResolvedValue({ ...state, request: refund })
    open()
    expect(await screen.findByDisplayValue('00123456789')).toBeTruthy()
    expect(screen.getByDisplayValue('NGUYEN VAN A')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Số tài khoản'), { target: { value: '00000012345' } })
    fireEvent.submit(form())
    await waitFor(() => expect(requestGuestRefund).toHaveBeenCalledWith(expect.objectContaining({ accountNumber: '00000012345' })))
  })

  it('refreshes a pending request on demand to show a later decision', async () => {
    vi.mocked(lookupGuestRefund).mockResolvedValueOnce({ ...state, request: refund })
      .mockResolvedValue({ ...state, eligible: false, request: { ...refund, status: 'COMPLETED', adminNote: 'Đã chuyển tiền' } })
    open()
    await screen.findByRole('form')
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra lại trạng thái' }))
    expect(await screen.findByText('Ghi chú từ chủ sân: Đã chuyển tiền')).toBeTruthy()
    expect(screen.queryByRole('form')).toBeNull()
    expect(lookupGuestRefund).toHaveBeenCalledTimes(2)
    expect(requestGuestRefund).not.toHaveBeenCalled()
  })

  it.each(['APPROVED', 'REJECTED', 'COMPLETED'] as const)('shows %s with the decision and proof, without a bank form', async (status) => {
    vi.mocked(lookupGuestRefund).mockResolvedValue({ ...state, eligible: false, request: { ...refund, status, adminNote: 'Đã kiểm tra', transferProofUrl: 'https://cdn.example/proof.png' } })
    open()
    expect(await screen.findByText(/Ghi chú từ chủ sân: Đã kiểm tra/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Xem chứng từ chuyển khoản' }).getAttribute('href')).toBe('https://cdn.example/proof.png')
    expect(screen.queryByRole('form')).toBeNull()
  })

  it('does not submit invalid bank data', async () => {
    open()
    await screen.findByRole('form')
    fireEvent.submit(form())
    expect(screen.getByRole('alert').textContent).toContain('Tên ngân hàng')
    expect(requestGuestRefund).not.toHaveBeenCalled()
    const valid = { bankName: 'VCB', accountNumber: '001234', accountHolder: 'AB' }
    expect(validateGuestRefund(valid)).toBeNull()
    expect(validateGuestRefund({ ...valid, accountNumber: '1'.repeat(20), bankBin: '970436', accountHolder: 'A'.repeat(150) })).toBeNull()
    for (const fields of [{ bankName: ' ' }, { bankName: 'A'.repeat(101) }, { accountNumber: '12345' }, { accountNumber: '1'.repeat(21) }, { accountNumber: '12345a' }, { accountHolder: 'A' }, { accountHolder: 'A'.repeat(151) }, { bankBin: '123456' }]) {
      expect(validateGuestRefund({ ...valid, ...fields })).toBeTypeOf('string')
    }
  })

  it('blocks changes on 409 until the status is checked again', async () => {
    vi.mocked(lookupGuestRefund).mockResolvedValue({ ...state, request: refund })
    vi.mocked(requestGuestRefund).mockRejectedValue(new ApiError({ status: 409, message: 'conflict' }))
    open()
    await screen.findByRole('form')
    fireEvent.submit(form())
    expect((await screen.findByRole('alert')).textContent).toContain('đã được xử lý')
    expect(save().disabled).toBe(true)
    vi.mocked(lookupGuestRefund).mockResolvedValue({ ...state, eligible: false, request: { ...refund, status: 'APPROVED' } })
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra lại trạng thái' }))
    await waitFor(() => expect(screen.queryByRole('form')).toBeNull())
  })

  it.each(['lookup', 'submit'])('honors Retry-After on %s, with no automatic retries or focus refetch', async (operation) => {
    let now = Date.now()
    vi.spyOn(Date, 'now').mockImplementation(() => now)
    const error = new ApiError({ status: 429, message: 'limited', retryAfterSeconds: 42 })
    if (operation === 'lookup') vi.mocked(lookupGuestRefund).mockRejectedValue(error)
    else {
      vi.mocked(lookupGuestRefund).mockResolvedValue({ ...state, request: refund })
      vi.mocked(requestGuestRefund).mockRejectedValue(error)
    }
    open()
    if (operation === 'submit') { await screen.findByRole('form'); fireEvent.submit(form()) }
    expect((await screen.findByRole('alert')).textContent).toContain('42 giây')
    const retry = screen.getByRole('button', { name: 'Kiểm tra lại trạng thái' }) as HTMLButtonElement
    expect(retry.disabled).toBe(true)
    if (operation === 'submit') expect(save().disabled).toBe(true)
    fireEvent.click(retry)
    act(() => { window.dispatchEvent(new Event('focus')) })
    expect(lookupGuestRefund).toHaveBeenCalledTimes(1)
    now += 42000
    act(() => { document.dispatchEvent(new Event('visibilitychange')) })
    expect(retry.disabled).toBe(false)
    expect(lookupGuestRefund).toHaveBeenCalledTimes(1)
  })

  it('maps other API failures without exposing identity details', () => {
    expect(guestRefundErrorMessage(new ApiError({ status: 404, message: 'phone wrong' }))).toContain('Kiểm tra lại mã đơn và số điện thoại')
    expect(guestRefundErrorMessage(new ApiError({ status: 429, message: 'x' }))).toContain('ít phút')
    expect(guestRefundErrorMessage(new ApiError({ status: 400, message: 'x' }))).toContain('chưa hợp lệ')
    expect(guestRefundErrorMessage(new Error('x'))).toContain('Vui lòng thử lại')
  })
})
