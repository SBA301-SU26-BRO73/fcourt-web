import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { ApiResponse } from '@/types/auth'
import type {
  BookingResponse,
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
}) {
  const formData = new FormData()
  formData.append('branchId', String(payload.branchId))
  payload.bookingIds.forEach((bookingId) => {
    formData.append('bookingIds', String(bookingId))
  })
  formData.append('amount', String(payload.amount))
  formData.append('billImage', payload.billImage)

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


