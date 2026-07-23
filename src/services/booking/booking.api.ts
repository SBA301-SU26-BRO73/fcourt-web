import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { ApiResponse } from '@/types/auth'
import type { SpringPage } from '@/types/court'
import type {
  BookingResponse,
  CancelBookingRequest,
  CreateBookingsRequest,
  CreateBookingsResponse,
  PaymentResponse,
} from '@/types/booking'

function requireData<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'The server returned no data.')
  }
  return response.data
}

export async function createBookings(payload: CreateBookingsRequest) {
  const { data } = await axiosClient.post<ApiResponse<CreateBookingsResponse>>(
    API_ENDPOINTS.bookings.list,
    payload,
  )
  return requireData(data)
}

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

  const { data } = await axiosClient.post<ApiResponse<PaymentResponse>>(
    API_ENDPOINTS.payments.list,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return requireData(data)
}

export async function getPaymentDetails(paymentId: number) {
  const { data } = await axiosClient.get<ApiResponse<PaymentResponse>>(
    API_ENDPOINTS.payments.detail(paymentId),
  )
  return requireData(data)
}

export async function getBookingDetails(bookingId: number) {
  const { data } = await axiosClient.get<ApiResponse<BookingResponse>>(
    `${API_ENDPOINTS.bookings.list}/${bookingId}`,
  )
  return requireData(data)
}

export async function cancelBooking(bookingId: number, payload: CancelBookingRequest) {
  const { data } = await axiosClient.post<ApiResponse<BookingResponse>>(
    API_ENDPOINTS.bookings.cancel(bookingId),
    payload,
  )
  return requireData(data)
}

/** Booking history for the logged-in member. */
export async function getMyBookings(page = 0, size = 20) {
  const { data } = await axiosClient.get<ApiResponse<SpringPage<BookingResponse>>>(
    API_ENDPOINTS.bookings.my,
    { params: { page, size, sort: 'createdAt,desc' } },
  )
  return requireData(data)
}

/** Public guest lookup by booking code + the phone on the booking. */
export async function lookupBooking(bookingCode: string, phone: string) {
  const { data } = await axiosClient.get<ApiResponse<BookingResponse>>(
    API_ENDPOINTS.bookings.lookup,
    { params: { bookingCode, phone } },
  )
  return requireData(data)
}

