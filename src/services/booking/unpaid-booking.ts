import { getMyBookings } from '@/services/booking/my-booking.api'
import type { MyBooking } from '@/types/my-booking'

/** The signed-in customer's live PENDING_PAYMENT booking (still inside its payment window), if any. */
export async function findUnpaidBooking(now = Date.now()): Promise<MyBooking | null> {
  const page = await getMyBookings('UPCOMING', 0, 20)
  return (
    page.content.find(
      (booking) =>
        booking.status === 'PENDING_PAYMENT' &&
        (!booking.holdExpiresAt || Date.parse(booking.holdExpiresAt) > now),
    ) ?? null
  )
}
