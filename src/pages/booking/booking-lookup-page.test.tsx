import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/common/utils/api-error'
import { lookupGuestBooking } from '@/services/booking/booking.api'
import type { GuestBooking } from '@/types/booking'

import { BookingLookupPage, lookupErrorMessage } from './booking-lookup-page'

vi.mock('@/services/booking/booking.api', () => ({ lookupGuestBooking: vi.fn() }))
vi.mock('@/components/booking/CheckinQrCard', () => ({
  CheckinQrCard: ({ checkinCode }: { checkinCode: string }) => <div>QR {checkinCode}</div>,
}))

const base: GuestBooking = {
  id: 1,
  bookingCode: 'FC12345678',
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

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('BookingLookupPage', () => {
  it('shows the QR only when the booking is CONFIRMED', async () => {
    vi.mocked(lookupGuestBooking).mockResolvedValue(base)
    render(<BookingLookupPage />)
    await submit()
    expect(await screen.findByText('QR 999')).toBeTruthy()
    expect(lookupGuestBooking).toHaveBeenCalledWith('fc12345678', '0912345678')
  })

  it('hides the QR for a booking that is not confirmed', async () => {
    vi.mocked(lookupGuestBooking).mockResolvedValue({ ...base, status: 'PENDING_PAYMENT', checkInCode: null })
    render(<BookingLookupPage />)
    await submit()
    expect(await screen.findByText(/chỉ hiển thị khi đơn đã được xác nhận/)).toBeTruthy()
    expect(screen.queryByText(/^QR /)).toBeNull()
  })

  it('shows a rate limit message with the Retry-After seconds', async () => {
    vi.mocked(lookupGuestBooking).mockRejectedValue(new ApiError({ status: 429, message: 'x', retryAfterSeconds: 42 }))
    render(<BookingLookupPage />)
    await submit()
    expect((await screen.findByRole('alert')).textContent).toContain('42 giây')
  })
})

describe('lookupErrorMessage', () => {
  it('maps 404, 429 without header, 400 and unknown errors', () => {
    expect(lookupErrorMessage(new ApiError({ status: 404, message: 'x' }))).toMatch(/Không tìm thấy/)
    expect(lookupErrorMessage(new ApiError({ status: 429, message: 'x' }))).toMatch(/ít phút/)
    expect(lookupErrorMessage(new ApiError({ status: 400, message: 'x' }))).toMatch(/định dạng/)
    expect(lookupErrorMessage(new Error('boom'))).toMatch(/Không thể tra cứu/)
  })
})
