import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { SpringPage } from '@/types/court'
import type {
  BookingResponse,
  CancelBookingRequest,
  CreateBookingsRequest,
  CreateBookingsResponse,
  PaymentResponse,
} from '@/types/booking'

// TODO(F2/F3): booking is now two steps: POST /bookings/hold-slots, then POST /bookings with an
// Idempotency-Key header and { holdToken, courtId, date, slotIds }. One booking per court per day.
export async function createBookings(payload: CreateBookingsRequest) {
  const { data } = await axiosClient.post<CreateBookingsResponse>(
    API_ENDPOINTS.bookings.create,
    payload,
  )
  return data
}

// TODO(F3): receipts upload per booking (POST /payments/{bookingId}/upload-receipt, part "file") after
// GET /payments/checkout-info/{bookingId}; there is no multi-booking payment any more.
export async function createPayment(payload: {
  branchId: number
  bookingIds: number[]
  amount: number
  billImage: File
  voucherCode?: string
}) {
  const formData = new FormData()
  formData.append('branchId', String(payload.branchId))
  payload.bookingIds.forEach((bookingId) => {
    formData.append('bookingIds', String(bookingId))
  })
  formData.append('amount', String(payload.amount))
  formData.append('billImage', payload.billImage)
  if (payload.voucherCode) {
    formData.append('voucherCode', payload.voucherCode)
  }

  const { data } = await axiosClient.post<PaymentResponse>(
    API_ENDPOINTS.payments.legacy,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}

export async function getPaymentDetails(paymentId: number) {
  const { data } = await axiosClient.get<PaymentResponse>(
    `${API_ENDPOINTS.payments.legacy}/${paymentId}`,
  )
  return data
}

export async function getBookingDetails(bookingId: number) {
  const { data } = await axiosClient.get<BookingResponse>(
    API_ENDPOINTS.bookings.detail(bookingId),
  )
  return data
}

export async function cancelBooking(bookingId: number, payload: CancelBookingRequest) {
  const { data } = await axiosClient.post<BookingResponse>(
    API_ENDPOINTS.bookings.cancel(bookingId),
    payload,
  )
  return data
}

/** Booking history for the logged-in member. */
export async function getMyBookings(page = 0, size = 20) {
  const { data } = await axiosClient.get<SpringPage<BookingResponse>>(
    API_ENDPOINTS.bookings.my,
    { params: { page, size, sort: 'createdAt,desc' } },
  )
  return data
}

/** Public guest lookup by booking code + the phone on the booking. */
export async function lookupBooking(bookingCode: string, phone: string) {
  const { data } = await axiosClient.get<BookingResponse>(
    API_ENDPOINTS.bookings.lookup,
    { params: { bookingCode, phone } },
  )
  return data
}

