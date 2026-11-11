import type { BookingStatus } from '@/types/staff'

export interface TimeSlotTemplate {
  id: number
  courtId: number
  courtName: string
  startTime: string
  endTime: string
  price: number
  dayOfWeek: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface BookingSlotResponse {
  id: number
  bookingId: number
  courtId: number
  bookingDate: string
  slotStart: string
  slotEnd: string
  priceAtBooking: number
}

export interface BookingResponse {
  id: number
  bookingCode: string
  /** Only present once the booking is CONFIRMED or CHECKED_IN. */
  checkinCode: string | null
  courtId: number
  courtName: string
  customerId: number | null
  customerEmail: string | null
  guestPhone: string | null
  date: string
  status: BookingStatus
  totalPrice: number
  paymentAmount: number | null
  refundAmount: number | null
  refundRequestId: number | null
  refundStatus: RefundRequestStatus | null
  refundReason: string | null
  refundBankName: string | null
  refundBankAccountNumber: string | null
  refundBankAccountName: string | null
  refundProofImageUrl: string | null
  slots: BookingSlotResponse[]
  paymentId: number | null
  branchId: number
  branchName: string
  branchAddress: string
  bankAccountNumber: string | null
  bankAccountName: string | null
  bankName: string | null
  bankQrImageUrl: string | null
  expiredAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CancelBookingRequest {
  guestPhone?: string
  reason?: string
  refundBankName?: string
  refundBankAccountNumber?: string
  refundBankAccountName?: string
}

export interface CreateBookingsRequest {
  guestPhone?: string
  bookings: Array<{
    courtId: number
    date: string
    slotStarts: string[]
  }>
}

export interface CreateBookingsResponse {
  branchId: number
  branchName: string
  branchAddress: string
  bankAccountNumber: string | null
  bankAccountName: string | null
  bankName: string | null
  bankQrImageUrl: string | null
  totalAmount: number
  bookings: BookingResponse[]
}

export interface PaymentResponse {
  id: number
  branchId: number
  branchName: string
  branchAddress: string
  bankAccountNumber: string | null
  bankAccountName: string | null
  bankName: string | null
  bankQrImageUrl: string | null
  amount: number
  billImageUrl: string | null
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  confirmedAt: string | null
  confirmedById: number | null
  bookings: Array<{
    id: number
    courtId: number
    courtName: string
    date: string
    status: BookingStatus
    totalPrice: number
    slots: BookingSlotResponse[]
  }>
  createdAt: string
  updatedAt: string
}

export type RefundRequestStatus = 'PENDING' | 'CONFIRMED'

export interface RefundRequestResponse {
  id: number
  bookingId: number
  bookingCode: string
  paymentId: number | null
  branchId: number
  branchName: string
  customerId: number | null
  customerEmail: string | null
  guestPhone: string | null
  amount: number
  reason: string
  refundBankName: string
  refundBankAccountNumber: string
  refundBankAccountName: string
  refundProofImageUrl: string | null
  status: RefundRequestStatus
  confirmedAt: string | null
  confirmedById: number | null
  createdAt: string
  updatedAt: string
}

/** booking-service GuestBookingResponse. checkInCode and qrImageUrl are only set when status is CONFIRMED. */
export interface GuestBooking {
  id: number
  bookingCode: string
  branchName: string
  branchAddress: string | null
  courtName: string
  date: string
  slots: Array<{ startTime: string; endTime: string; price: number }>
  totalPrice: number
  status: BookingStatus
  paymentStatus: string | null
  checkInCode: string | null
  qrImageUrl: string | null
}
