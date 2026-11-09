import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { pageFromApi } from '@/common/utils/api-page'
import { axiosClient } from '@/services/http/axios-client'
import type { SpringPage } from '@/types/court'
import type {
  ApiPage,
  CancellationPolicy,
  CustomerTransaction,
  MyBooking,
  MyBookingFilter,
  Ticket,
} from '@/types/my-booking'

/** Booking history of the signed-in customer (booking-service, `{ items, page, size, total }`). */
export async function getMyBookings(
  filter: MyBookingFilter = 'ALL',
  page = 0,
  size = 10,
): Promise<SpringPage<MyBooking>> {
  const { data } = await axiosClient.get<ApiPage<MyBooking>>(API_ENDPOINTS.bookings.my, {
    params: { status: filter, page, size },
  })
  return pageFromApi(data)
}

export async function getMyBooking(bookingId: number) {
  const { data } = await axiosClient.get<MyBooking>(API_ENDPOINTS.bookings.detail(bookingId))
  return data
}

export async function getCancellationPolicy(bookingId: number) {
  const { data } = await axiosClient.get<CancellationPolicy>(API_ENDPOINTS.bookings.cancellationPolicy(bookingId))
  return data
}

/**
 * Cancels a booking. The server requires a reason of 1-500 characters and answers with the
 * updated booking. Cancelling an already cancelled booking returns it unchanged, so the call
 * is safe to repeat and needs no Idempotency-Key (the Flutter app sends none either).
 */
export async function cancelMyBooking(bookingId: number, reason: string) {
  const trimmed = reason.trim()
  if (!trimmed || trimmed.length > 500) throw new Error('Vui lòng nhập lý do hủy (1-500 ký tự)')
  const { data } = await axiosClient.post<MyBooking>(API_ENDPOINTS.bookings.cancel(bookingId), { reason: trimmed })
  return data
}

/** 409 until the payment is confirmed, 410 when it was rejected or cancelled. */
export async function getTicket(bookingId: number) {
  const { data } = await axiosClient.get<Ticket>(API_ENDPOINTS.payments.ticket(bookingId))
  return data
}

export async function getMyTransactions(page = 0, size = 10): Promise<SpringPage<CustomerTransaction>> {
  const { data } = await axiosClient.get<ApiPage<CustomerTransaction>>(API_ENDPOINTS.payments.myTransactions, {
    params: { page, size },
  })
  return pageFromApi(data)
}
