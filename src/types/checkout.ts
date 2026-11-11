/** Customer booking and payment contracts of booking-service and payment-service (F3). */

/** POST /api/bookings body: the hold, never a price or an actor (unknown fields are rejected). */
export interface CreateBookingRequest {
  holdToken: string
  courtId: number
  /** yyyy-MM-dd */
  date: string
  slotIds: number[]
}

/** GET /api/payments/checkout-info/{bookingId} (payment-service CheckoutInfo). */
export interface CheckoutInfo {
  bookingId: number
  bookingCode: string
  branchId: number
  branchName: string
  courtName: string
  date: string
  slots: Array<{ startTime: string; endTime: string; price: number }>
  /** Whole VND; 0 only for a voucher-discounted free booking. */
  amount: number
  bankName: string
  /** Six-digit napas BIN, used by VietQR. */
  bankBin: string
  bankAccountNumber: string
  bankAccountName: string
  /** Booking code prefixed with FC only when it does not already start with FC. */
  transferContent: string
  /** Absolute checkout deadline (the hold expiry). */
  expiresAt: string
  customerName: string | null
}

export type ReceiptStatusValue = 'PENDING' | 'CONFIRMED' | 'REJECTED'

/** POST upload-receipt response and the non-compact GET status. */
export interface ReceiptStatus {
  id: number
  bookingId: number
  status: ReceiptStatusValue
  receiptImageUrl: string | null
  submittedAt: string | null
  rejectionReason: string | null
}

export type CompactPaymentState = 'PENDING' | 'SUCCESS' | 'REJECTED'

/** GET /api/payments/{bookingId}/status?compact=true */
export interface CompactPaymentStatus {
  bookingId: number
  paymentStatus: CompactPaymentState
  rejectReason: string | null
  updatedAt: string
}

/** POST /api/payments/{bookingId}/confirm-free */
export interface FreePayment {
  id: number
  bookingId: number
  amount: number
  status: ReceiptStatusValue
  confirmedAt: string | null
}
