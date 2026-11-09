import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'

export interface BookingSlotResponse {
    id: number
    bookingId: number
    courtId: number
    bookingDate: string
    slotStart: string
    slotEnd: string
    priceAtBooking: number
}

export interface Booking {
    id: number
    courtId: number
    courtName: string
    customerId: number
    customerEmail: string
    guestPhone: string
    date: string
    status?: BookingStatus
    bookingStatus?: BookingStatus
    bookingstatus?: BookingStatus
    totalPrice: number
    refundAmount?: number | null
    refundRequestId?: number | null
    refundStatus?: 'PENDING' | 'CONFIRMED' | null
    refundReason?: string | null
    refundBankName?: string | null
    refundBankAccountNumber?: string | null
    refundBankAccountName?: string | null
    refundProofImageUrl?: string | null
    createdAt: string
    updatedAt: string
    slots?: BookingSlotResponse[]
    paymentId?: number
    billImageUrl?: string | null
}

export type BookingStatus =
    | 'PENDING_PAYMENT'
    | 'AWAITING_CONFIRMATION'
    | 'CONFIRMED'
    | 'CHECKED_IN'
    | 'COMPLETED'
    | 'CANCELLED'

export interface UpdateBookingStatusRequest {
    status: BookingStatus
}

export interface PageResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
}

export interface T {
    success: boolean
    message: string
    data: T
}

export const bookingService = {
    getAll: async (
        page = 0,
        size = 10,
    ): Promise<PageResponse<Booking>> => {
        const response = await axiosClient.get<
            PageResponse<Booking>
        >(API_ENDPOINTS.bookings.adminList, {
            params: {
                page,
                size,
                sort: ['createdAt,desc', 'id,desc'],
            },
        })

        return response.data
    },

    // TODO(F9): the backend has no manual booking status change; status follows the payment,
    // cancel, check-in and checkout flows. This call is expected to fail until F9 replaces it.
    updateStatus: async (
        id: number,
        payload: UpdateBookingStatusRequest,
    ): Promise<Booking | null> => {
        const response = await axiosClient.put<Booking | null>(
            `/bookings/${id}/status`,
            payload,
        )

        return response.data
    },

    // The path key is the paymentId; the method changed from POST to PUT.
    approvePayment: async (paymentId: number) => {
        const response = await axiosClient.put<unknown>(
            API_ENDPOINTS.payments.confirm(paymentId),
        )

        return response.data
    },

    rejectPayment: async (paymentId: number) => {
        const response = await axiosClient.put<unknown>(
            API_ENDPOINTS.payments.reject(paymentId),
        )

        return response.data
    },
}
