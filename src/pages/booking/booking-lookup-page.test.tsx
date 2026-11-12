import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ApiError } from '@/common/utils/api-error'
import { cancelGuestBooking, lookupGuestBooking } from '@/services/booking/booking.api'
import type { GuestBooking } from '@/types/booking'
import { lookupGuestRefund, requestGuestRefund } from '@/services/refund/guest-refund.api'

import { BookingLookupPage, cancelErrorMessage, lookupErrorMessage } from './booking-lookup-page'

vi.mock('@/services/booking/booking.api', () => ({ lookupGuestBooking: vi.fn(), cancelGuestBooking: vi.fn() }))
vi.mock('@/services/refund/guest-refund.api', () => ({ lookupGuestRefund: vi.fn(), requestGuestRefund: vi.fn() }))
vi.mock('@/components/booking/CheckinQrCard', () => ({
  CheckinQrCard: ({ checkinCode }: { checkinCode: string }) => <div>QR {checkinCode}</div>,
}))

const base: GuestBooking = {
  id: 1,
  bookingCode: 'FC12345678',
  branchId: 7,
  refundAmount: null,
  branchName: 'CN 1',
  branchAddress: null,
  courtName: 'Sân 1',
  date: '2030-01-01',
  slots: [{ startTime: '06:00:00', endTime: '07:00:00', price: 100000 }],
  totalPrice: 100000,
  status: 'CONFIRMED',
  paymentStatus: 'SUCCESS',
  checkInCode: '999',
  qrImageUrl: null,
}

async function submit() {
  fireEvent.change(screen.getByLabelText(/Mã đơn/), { target: { value: 'fc12345678' } })
  fireEvent.change(screen.getByLabelText(/Số điện thoại/), { target: { value: '0912345678' } })
  fireEvent.click(screen.getByRole('button', { name: /Tra cứu/ }))
}

function renderLookup() {
  return render(<QueryClientProvider client={new QueryClient()}><BookingLookupPage /></QueryClientProvider>)
}

beforeEach(() => {
  vi.mocked(lookupGuestRefund).mockResolvedValue({ bookingId: 1, amount: 100000, eligible: true, request: null })
  vi.mocked(requestGuestRefund).mockResolvedValue({
    id: 25, bookingId: 1, amount: 100000, status: 'PENDING', bankName: 'VCB', bankBin: null,
    bankAccountNumber: '0123456789', bankAccountName: 'NGUYEN VAN A', customerPhone: '0912345678',
    bankInfoMissing: false, reason: null, adminNote: null, transferProofUrl: null,
    createdAt: '2026-11-12T01:00:00Z', updatedAt: '2026-11-12T01:00:00Z',
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('BookingLookupPage', () => {
  it('shows the QR only when the booking is CONFIRMED', async () => {
    vi.mocked(lookupGuestBooking).mockResolvedValue(base)
    renderLookup()
    await submit()
    expect(await screen.findByText('QR 999')).toBeTruthy()
    expect(lookupGuestBooking).toHaveBeenCalledWith('fc12345678', '0912345678')
  })

  it('hides the QR for a booking that is not confirmed', async () => {
    vi.mocked(lookupGuestBooking).mockResolvedValue({ ...base, status: 'PENDING_PAYMENT', checkInCode: null })
    renderLookup()
    await submit()
    expect(await screen.findByText(/chỉ hiển thị khi đơn đã được xác nhận/)).toBeTruthy()
    expect(screen.queryByText(/^QR /)).toBeNull()
  })

  it('shows a rate limit message with the Retry-After seconds', async () => {
    vi.mocked(lookupGuestBooking).mockRejectedValue(new ApiError({ status: 429, message: 'x', retryAfterSeconds: 42 }))
    renderLookup()
    await submit()
    expect((await screen.findByRole('alert')).textContent).toContain('42 giây')
  })

  it('loads refunds only for a cancelled booking with a positive entitlement', async () => {
    for (const booking of [{ ...base, refundAmount: 100000 }, { ...base, status: 'CANCELLED' as const, refundAmount: 0 }]) {
      vi.mocked(lookupGuestBooking).mockResolvedValue(booking)
      renderLookup()
      await submit()
      await screen.findByText('Sân 1')
      expect(lookupGuestRefund).not.toHaveBeenCalled()
      cleanup()
    }
    vi.mocked(lookupGuestBooking).mockResolvedValue({ ...base, status: 'CANCELLED', refundAmount: 100000 })
    renderLookup()
    await submit()
    expect(await screen.findByRole('form', { name: 'Thông tin nhận tiền hoàn' })).toBeTruthy()
    // Editing lookup fields after verification must not change the refund identity.
    fireEvent.change(screen.getByLabelText(/Mã đơn/), { target: { value: 'FC99999999' } })
    fireEvent.change(screen.getByLabelText('Tên ngân hàng'), { target: { value: 'VCB' } })
    fireEvent.change(screen.getByLabelText('Số tài khoản'), { target: { value: '0123456789' } })
    fireEvent.change(screen.getByLabelText('Tên chủ tài khoản'), { target: { value: 'NGUYEN VAN A' } })
    fireEvent.submit(screen.getByRole('form', { name: 'Thông tin nhận tiền hoàn' }))
    expect(lookupGuestRefund).toHaveBeenCalledWith({ bookingCode: 'fc12345678', phone: '0912345678' })
    await vi.waitFor(() => expect(requestGuestRefund).toHaveBeenCalledWith(expect.objectContaining({ bookingCode: 'fc12345678', phone: '0912345678' })))
    expect(await screen.findByText('Đã lưu thông tin nhận tiền hoàn.')).toBeTruthy()
  })
})

it('shares the refund Retry-After cooldown with booking lookup', async () => {
  vi.mocked(lookupGuestBooking).mockResolvedValue({ ...base, status: 'CANCELLED', refundAmount: 100000 })
  vi.mocked(lookupGuestRefund).mockRejectedValue(new ApiError({ status: 429, message: 'x', retryAfterSeconds: 42 }))
  renderLookup()
  await submit()
  expect((await screen.findByRole('alert')).textContent).toContain('42 giây')
  const lookupButton = screen.getByRole('button', { name: 'Tra cứu' }) as HTMLButtonElement
  expect(lookupButton.disabled).toBe(true)
  fireEvent.click(lookupButton)
  expect(lookupGuestBooking).toHaveBeenCalledTimes(1)
  expect(lookupGuestRefund).toHaveBeenCalledTimes(1)
})

describe('lookupErrorMessage', () => {
  it('maps 404, 429 without header, 400 and unknown errors', () => {
    expect(lookupErrorMessage(new ApiError({ status: 404, message: 'x' }))).toMatch(/Không tìm thấy/)
    expect(lookupErrorMessage(new ApiError({ status: 429, message: 'x' }))).toMatch(/ít phút/)
    expect(lookupErrorMessage(new ApiError({ status: 400, message: 'x' }))).toMatch(/định dạng/)
    expect(lookupErrorMessage(new Error('boom'))).toMatch(/Không thể tra cứu/)
  })
})

describe('guest cancel', () => {
  it('offers the cancel button only for cancellable statuses', async () => {
    for (const status of ['COMPLETED', 'CANCELLED', 'CHECKED_IN'] as const) {
      vi.mocked(lookupGuestBooking).mockResolvedValue({ ...base, status, checkInCode: null })
      renderLookup()
      await submit()
      await screen.findByText('Sân 1')
      expect(screen.queryByRole('button', { name: /Hủy đặt sân/ })).toBeNull()
      cleanup()
    }
  })

  it('asks for confirmation, cancels with the looked-up code and phone and shows the new status', async () => {
    vi.mocked(lookupGuestBooking).mockResolvedValue(base)
    vi.mocked(cancelGuestBooking).mockResolvedValue({ bookingCode: 'FC12345678', status: 'CANCELLED', refundAmount: 100000, currency: 'VND' })
    renderLookup()
    await submit()
    fireEvent.click(await screen.findByRole('button', { name: /Hủy đặt sân/ }))
    expect(cancelGuestBooking).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText(/Lý do hủy/), { target: { value: ' Bận việc ' } })
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận hủy/ }))
    expect(await screen.findByRole('status')).toBeTruthy()
    expect(cancelGuestBooking).toHaveBeenCalledWith('fc12345678', '0912345678', ' Bận việc ')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByRole('button', { name: /Hủy đặt sân/ })).toBeNull()
    expect(screen.queryByText('QR 999')).toBeNull()
    expect(await screen.findByRole('form', { name: 'Thông tin nhận tiền hoàn' })).toBeTruthy()
  })

  it('keeps the dialog open and shows the server reason when the cut-off has passed', async () => {
    vi.mocked(lookupGuestBooking).mockResolvedValue(base)
    vi.mocked(cancelGuestBooking).mockRejectedValue(new ApiError({ status: 400, message: 'Đã quá thời hạn hủy' }))
    renderLookup()
    await submit()
    fireEvent.click(await screen.findByRole('button', { name: /Hủy đặt sân/ }))
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận hủy/ }))
    expect(await screen.findByText('Đã quá thời hạn hủy')).toBeTruthy()
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('closing the dialog does not cancel', async () => {
    vi.mocked(lookupGuestBooking).mockResolvedValue(base)
    renderLookup()
    await submit()
    fireEvent.click(await screen.findByRole('button', { name: /Hủy đặt sân/ }))
    fireEvent.click(screen.getByRole('button', { name: /Giữ đơn/ }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(cancelGuestBooking).not.toHaveBeenCalled()
  })

  it('maps cancel errors', () => {
    expect(cancelErrorMessage(new ApiError({ status: 404, message: 'x' }))).toMatch(/Không tìm thấy/)
    expect(cancelErrorMessage(new ApiError({ status: 429, message: 'x' }))).toMatch(/quá nhiều/)
    expect(cancelErrorMessage(new Error('boom'))).toMatch(/Không thể hủy/)
  })
})
