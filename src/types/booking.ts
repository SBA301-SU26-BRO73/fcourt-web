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
