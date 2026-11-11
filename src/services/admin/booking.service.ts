import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { pageFromApi } from '@/common/utils/api-page'
import { newIdempotencyKey } from '@/services/booking/booking.api'
import { axiosClient } from '@/services/http/axios-client'
import type { AdminBooking, AdminBookingApiPage, AdminBookingParams, BookingStatus } from '@/types/admin-booking'

export type { AdminBooking, BookingStatus }

/**
 * `GET /admin/bookings` answers `{ items, page, size, total }` for the owner's branches.
 * There is no manual status change: status follows payment, cancel, check-in and checkout.
 */
export async function getAdminBookings(params: AdminBookingParams) {
  const response = await axiosClient.get<AdminBookingApiPage>(API_ENDPOINTS.bookings.adminList, {
    params: {
      page: params.page,
      size: params.size,
      sortBy: 'createdAt',
      direction: 'DESC',
      ...(params.branchId ? { branchId: params.branchId } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    },
  })
  return pageFromApi(response.data)
}

/** `POST /admin/bookings/{id}/cancel`: the owner cancels (reason required); a paid booking is refunded in full. */
export async function cancelAdminBooking(bookingId: number, reason: string, idempotencyKey = newIdempotencyKey()) {
  const response = await axiosClient.post<unknown>(
    API_ENDPOINTS.bookings.adminCancel(bookingId),
    { reason: reason.trim() },
    { headers: { 'Idempotency-Key': idempotencyKey } },
  )
  return response.data
}

/** Keyed by paymentId; the method is PUT. */
export async function approvePayment(paymentId: number) {
  const response = await axiosClient.put<unknown>(API_ENDPOINTS.payments.confirm(paymentId))
  return response.data
}

/** The reason (1-500 characters) is required by the server. */
export async function rejectPayment(paymentId: number, reason: string) {
  const response = await axiosClient.put<unknown>(API_ENDPOINTS.payments.reject(paymentId), {
    reason: reason.trim(),
  })
  return response.data
}
