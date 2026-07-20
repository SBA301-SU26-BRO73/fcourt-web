
export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED'

export interface PaymentBookingResponse {
  id: number
  courtId: number
  courtName: string
  date: string
  status: string
  totalPrice: number
}

export interface Payment {
  id: number
  branchId: number
  branchName: string
  amount: number
  billImageUrl: string
  status: PaymentStatus
  confirmedAt: string | null
  confirmedById: number | null
  bookings: PaymentBookingResponse[]
  voucherCode: string | null
  discountAmount: number
  customerName: string | null
  customerPhone: string | null
  createdAt: string
  updatedAt: string
}

export interface PaymentListParams {
  page: number
  size: number
  branchId?: number
  hasVoucher?: boolean
}
