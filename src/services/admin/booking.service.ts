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

export interface ApiResponse<T> {
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
            ApiResponse<PageResponse<Booking>>
        >('/bookings', {
            params: {
                page,
                size,
            },
        })

        return response.data.data
    },

    updateStatus: async (
        id: number,
        payload: UpdateBookingStatusRequest,
    ): Promise<Booking | null> => {
        const response = await axiosClient.put<ApiResponse<Booking | null>>(
            `/bookings/${id}/status`,
            payload,
        )

        return response.data.data
    },

    approvePayment: async (paymentId: number) => {
        const response = await axiosClient.post<ApiResponse<unknown>>(
            `/payments/${paymentId}/approve`,
        )

        return response.data.data
    },

    rejectPayment: async (paymentId: number) => {
        const response = await axiosClient.post<ApiResponse<unknown>>(
            `/payments/${paymentId}/reject`,
        )

        return response.data.data
    },
}
