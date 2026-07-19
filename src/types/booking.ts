import type { BookingStatus } from '@/types/staff'

export interface WalkInBookingRequest {
  staffUserId: number
  courtId: number
  guestPhone: string
  slotStarts: string[]
}

export interface WalkInBookingResponse {
  bookingId: number
  courtId: number
  courtName: string
  guestPhone: string
  date: string
  startTime: string
  endTime: string
  slotCount: number
  totalPrice: number
  status: BookingStatus
  checkinCode: string
  checkedInAt: string
  paymentId: number
}

export interface StaffCheckoutRequest {
  staffUserId: number
  bookingId: number
}

export interface StaffCheckoutResponse {
  bookingId: number
  courtName: string
  status: BookingStatus
  totalPrice: number
  completedAt: string
}

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
  courtId: number
  courtName: string
  customerId: number | null
  customerEmail: string | null
  guestPhone: string | null
  date: string
  status: BookingStatus
  totalPrice: number
  slots: BookingSlotResponse[]
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


