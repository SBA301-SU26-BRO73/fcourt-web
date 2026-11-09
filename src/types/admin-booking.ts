export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'AWAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'

export type BookingPaymentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'PAID'

/** Row of `GET /admin/bookings` (booking-service AdminBookingView). */
export interface AdminBooking {
  id: number
  bookingCode: string
  branchId: number
  branchName: string
  courtId: number
  courtName: string
  /** yyyy-MM-dd */
  date: string
  customerName: string | null
  customerPhone: string | null
  status: BookingStatus
  paymentStatus: BookingPaymentStatus | null
  totalPrice: number
  /** ISO instant */
  createdAt: string
  receiptImageUrl: string | null
}

export interface AdminBookingApiPage {
  items: AdminBooking[]
  page: number
  size: number
  total: number
}

export interface AdminBookingParams {
  branchId?: number
  status?: BookingStatus
  search?: string
  page: number
  size: number
}

export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'

/** `GET /admin/refunds/pending` element (payment-service RefundView). */
export interface AdminRefund {
  id: number
  bookingId: number
  amount: number
  status: RefundStatus
  bankName: string | null
  bankBin: string | null
  bankAccountNumber: string | null
  bankAccountName: string | null
  reason: string | null
  adminNote: string | null
  transferProofUrl: string | null
  createdAt: string
  updatedAt: string
}

export type FullCourtState =
  | 'RESERVING'
  | 'BOOKED'
  | 'COMMITTED'
  | 'FAILED'
  | 'LOCK_LOST'
  | 'CANCELLING'
  | 'CANCELLED'

export type FullCourtLockState = 'COMMITTED' | 'PENDING_COMMIT' | 'LOST' | 'RELEASING' | 'RELEASED'

export interface FullCourtWindow {
  branchId: number
  courtIds: number[]
  /** yyyy-MM-dd */
  date: string
  /** HH:mm (30 minute steps) */
  startTime: string
  endTime: string
}

export interface FullCourtRequest extends FullCourtWindow {
  contactName: string
  contactPhone: string
}

export interface FullCourtQuote extends FullCourtWindow {
  courtHours: number
  subtotal: number
  discountPercent: number
  discountAmount: number
  total: number
  currency: string
  reserved: boolean
  reservationState: string
}

export interface FullCourtBookingRef {
  bookingId: number
  courtId: number
  bookingCode: string
  totalAmount: number
}

export interface FullCourtPackage extends FullCourtWindow {
  packageId: string
  state: FullCourtState
  lockState: FullCourtLockState
  courtHours: number
  subtotal: number
  discountPercent: number
  discountAmount: number
  total: number
  currency: string
  depositPercent: number
  depositAmount: number
  balanceAmount: number
  contactName: string
  contactPhone: string
  cancellationReason: string | null
  bookings: FullCourtBookingRef[]
}

/** HTTP 202 means the bookings stand but the facility lock is still being confirmed or released. */
export interface FullCourtResult {
  pkg: FullCourtPackage
  pending: boolean
}
