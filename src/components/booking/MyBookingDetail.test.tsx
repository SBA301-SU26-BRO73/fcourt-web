import { cleanup, render, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getMyBooking, getTicket } from '@/services/booking/my-booking.api'
import type { MyBooking } from '@/types/my-booking'
import { MyBookingDetail } from './MyBookingDetail'

vi.mock('@/services/booking/my-booking.api', () => ({ getMyBooking: vi.fn(), getTicket: vi.fn() }))
vi.mock('@/components/booking/CheckinQrCard', () => ({ CheckinQrCard: () => null }))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function booking(status: MyBooking['status']): MyBooking {
  return { id: 7, status, bookingCode: 'FC7', slots: [], totalPrice: 100000, refundAmount: null } as unknown as MyBooking
}

function openDetail(listed: MyBooking, cached?: MyBooking) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (cached) client.setQueryData(['my-bookings', 'detail', listed.id], cached)
  // Leave the detail refresh pending to exercise the state before the network responds.
  vi.mocked(getMyBooking).mockReturnValue(new Promise(() => {}))
  vi.mocked(getTicket).mockResolvedValue({ checkInCode: null } as never)
  render(
    <QueryClientProvider client={client}>
      <MyBookingDetail booking={listed} onPay={vi.fn()} onCancel={vi.fn()} onRefund={vi.fn()} onReview={vi.fn()} />
    </QueryClientProvider>,
  )
}

describe('booking detail ticket requests', () => {
  it.each(['PENDING_PAYMENT', 'AWAITING_CONFIRMATION', 'CANCELLED'] as const)('does not request a ticket for %s', async (status) => {
    openDetail(booking(status))
    await waitFor(() => expect(getMyBooking).toHaveBeenCalledWith(7))
    expect(getTicket).not.toHaveBeenCalled()
  })

  it.each(['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] as const)('requests a ticket for %s', async (status) => {
    openDetail(booking(status))
    await waitFor(() => expect(getTicket).toHaveBeenCalledWith(7))
  })

  it('does not let cached confirmed detail re-enable a cancelled booking ticket', async () => {
    openDetail(booking('CANCELLED'), booking('CONFIRMED'))
    await waitFor(() => expect(getMyBooking).toHaveBeenCalledWith(7))
    expect(getTicket).not.toHaveBeenCalled()
  })
})
