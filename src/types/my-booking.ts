import type { BookingStatus } from '@/types/staff'

/** Filter accepted by GET /api/bookings/my (booking-service BookingQueries.history). */
export type MyBookingFilter = 'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'

export interface MyBookingSlot {
  startTime: string // HH:mm:ss
  endTime: string
  price: number
}

/** booking-service BookingView. */
export interface MyBooking {
  id: number
  bookingCode: string
  branchId: number | null
  branchName: string
  branchAddress: string | null
  branchPhone: string | null
  courtId: number
  courtName: string
  date: string // YYYY-MM-DD
  slots: MyBookingSlot[]
  totalPrice: number
  status: BookingStatus
  customerName: string | null
  holdExpiresAt: string | null
  /** Only set once the booking is CONFIRMED or CHECKED_IN. */
  checkInCode: string | null
  qrImageUrl: string | null
  receiptImageUrl: string | null
  paymentStatus: string | null
  createdAt: string
  refundAmount: number | null
  cancellationReason: string | null
  voucherApplicationId: string | null
  voucherId: number | null
  originalAmount: number | null
  discountAmount: number | null
  paymentFrozen: boolean
}

/** `{ items, page, size, total }` envelope shared by the booking and payment services. */
export interface ApiPage<T> {
  items: T[]
  page: number
  size: number
  total: number
}

/** GET /api/bookings/{id}/cancellation-policy. */
export interface CancellationPolicy {
  allowed: boolean
  reason: string
  startsAt: string | null
  cancelBefore: string | null
  cutoffHours: number
  refundAmount: number
  refundPercent: number
  currency: string
}

export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'

/** payment-service RefundView. */
export interface Refund {
  id: number
  bookingId: number
  amount: number
  status: RefundStatus
  bankName: string | null
  bankBin: string | null
  bankAccountNumber: string | null
  bankAccountName: string | null
  customerPhone: string | null
  bankInfoMissing: boolean
  reason: string | null
  adminNote: string | null
  transferProofUrl: string | null
  createdAt: string
  updatedAt: string
}

/** GET /api/refunds/booking/{bookingId}. */
export interface RefundState {
  bookingId: number
  amount: number
  eligible: boolean
  request: Refund | null
}

/** POST /api/refunds/request. The amount is decided by the server, never sent. */
export interface RefundRequestPayload {
  bookingId: number
  bankName: string
  bankBin: string
  bankAccountNumber: string
  bankAccountName: string
  reason: string
}

/** GET /api/payments/{bookingId}/ticket. */
export interface Ticket {
  bookingId: number
  bookingCode: string
  branchName: string
  courtName: string
  date: string
  slots: Array<{ startTime: string; endTime: string; price: number }>
  checkInCode: string
  qrImageUrl: string | null
}

/** GET /api/payments/my-transactions item. */
export interface CustomerTransaction {
  id: number
  transactionCode: string
  bookingId: number
  bookingCode: string
  branchName: string
  courtName: string
  amount: number
  method: string
  status: string
  occurredAt: string
  receiptImageUrl: string | null
}

export interface CreateReviewPayload {
  bookingId: number
  rating: number
  comment?: string
  imageUrls?: string[]
}

/** discovery-service Review (bookingId and userId are never serialized). */
export interface CreatedReview {
  id: number
  branchId: number
  courtId: number
  reviewerName: string
  reviewerAvatarUrl: string | null
  rating: number
  comment: string | null
  imageUrls: string[]
  adminReply: string | null
  createdAt: string
  repliedAt: string | null
}
