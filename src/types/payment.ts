export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED'

/** CheckoutInfo snapshot stored with a payment; only the fields the owner screens read. */
export interface PaymentCheckout {
  bookingCode: string | null
  branchName: string | null
  courtName: string | null
  customerName: string | null
  date: string | null
  amount: number | null
}

/** `GET /admin/payments/pending` element (payment-service PaymentRecord). */
export interface PendingPayment {
  id: number
  bookingId: number
  branchId: number
  amount: number
  status: PaymentStatus
  receiptImageUrl: string | null
  /** ISO instant */
  submittedAt: string | null
  rejectionReason: string | null
  checkout: PaymentCheckout | null
  customerId: number | null
  confirmedAt: string | null
}

export type LedgerTransactionType = 'ALL' | 'BOOKING_PAYMENT' | 'REFUND' | 'WALK_IN_CASH'
export type LedgerStatus = 'ALL' | 'SUCCESS' | 'PENDING' | 'REJECTED'

/** One row of `GET /admin/payments/transactions?transactionType=...`; refunds carry a negative amount. */
export interface LedgerEntry {
  id: number
  transactionKey: string
  transactionType: Exclude<LedgerTransactionType, 'ALL'>
  transactionCode: string
  bookingId: number
  bookingCode: string
  branchName: string
  courtName: string
  amount: number
  method: string
  status: Exclude<LedgerStatus, 'ALL'>
  /** ISO instant */
  occurredAt: string
  receiptImageUrl: string | null
}

export interface LedgerSummary {
  received: number
  refunded: number
  netRevenue: number
  pending: number
  rejectedCount: number
}

export interface LedgerApiPage {
  items: LedgerEntry[]
  page: number
  size: number
  total: number
  summary: LedgerSummary
}

export interface LedgerParams {
  branchId: number
  transactionType: LedgerTransactionType
  status: LedgerStatus
  fromDate?: string
  toDate?: string
  search?: string
  page: number
  size: number
}
