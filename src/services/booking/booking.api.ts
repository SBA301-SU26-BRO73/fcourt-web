import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { BookingResponse, CancelBookingRequest } from '@/types/booking'
import type { CreateBookingRequest } from '@/types/checkout'
import type { MyBooking } from '@/types/my-booking'

/** UUID for the Idempotency-Key header; a fallback keeps old WebViews and tests working. */
export function newIdempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    return (char === 'x' ? random : (random & 0x3) | 0x8).toString(16)
  })
}

/** X-Hold-Token is the credential of a guest booking; a signed-in customer uses the JWT instead. */
export function holdTokenHeaders(holdToken?: string | null) {
  return holdToken ? { 'X-Hold-Token': holdToken } : undefined
}

/**
 * POST /api/bookings (booking-service, CUSTOMER JWT): turns a live hold into a PENDING_PAYMENT
 * booking. The same key and selection replay the same booking, so a lost response is safe to retry.
 */
export async function createBooking(payload: CreateBookingRequest, idempotencyKey: string) {
  const { data } = await axiosClient.post<MyBooking>(API_ENDPOINTS.bookings.create, payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return data
}

/** GET /api/bookings/{id}: owner JWT, or the guest `X-Hold-Token` for a guest-only booking. */
export async function getBookingDetail(bookingId: number, holdToken?: string | null) {
  const { data } = await axiosClient.get<MyBooking>(API_ENDPOINTS.bookings.detail(bookingId), {
    headers: holdTokenHeaders(holdToken),
  })
  return data
}

// TODO(F5-guest): the two calls below still target the old monolith; the guest lookup item replaces them.
export async function cancelBooking(bookingId: number, payload: CancelBookingRequest) {
  const { data } = await axiosClient.post<BookingResponse>(
    API_ENDPOINTS.bookings.cancel(bookingId),
    payload,
  )
  return data
}

export async function lookupBooking(bookingCode: string, phone: string) {
  const { data } = await axiosClient.get<BookingResponse>(
    API_ENDPOINTS.bookings.lookup,
    { params: { bookingCode, phone } },
  )
  return data
}
