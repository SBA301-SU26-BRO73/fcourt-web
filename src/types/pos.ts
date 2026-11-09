/** Retail point of sale of pos-retail-service (F13). Money is whole VND. */

/** GET /api/staff/pos/products (PosViews.Product) */
export interface PosProduct {
  id: number
  branchId: number
  name: string
  unit: string | null
  category: string
  price: number
  active: boolean
  stockQuantity: number
  imageUrl: string | null
}

export interface PosProductParams {
  query?: string
  category?: string
  limit?: number
  offset?: number
}

/** CASH is a standalone paid bill; BOOKING adds the order to a CHECKED_IN booking's bill. */
export type PosPaymentMethod = 'CASH' | 'BOOKING'

/** PAID and ON_BOOKING are settled, PENDING_CHARGE waits for the booking-service, CANCELLED is final. */
export type PosOrderStatus = 'PAID' | 'ON_BOOKING' | 'PENDING_CHARGE' | 'CANCELLED' | (string & {})

export interface PosOrderItemRequest {
  productId: number
  quantity: number
}

/** POST /api/staff/pos/orders body; `bookingId` is required for BOOKING only. */
export interface CreatePosOrderRequest {
  paymentMethod: PosPaymentMethod
  bookingId?: number
  items: PosOrderItemRequest[]
}

export interface PosOrderItem {
  productId: number
  productName: string
  unit: string | null
  quantity: number
  priceAtOrder: number
  lineTotal: number
}

/** PosViews.Order, answered by POST (201 or 202), GET /{id} and the history list. */
export interface PosOrder {
  id: number
  orderCode: string
  branchId: number
  bookingId: number | null
  cashierUserId: number
  totalAmount: number
  paymentMethod: PosPaymentMethod
  status: PosOrderStatus
  createdAt: string
  paidAt: string | null
  version: number
  items: PosOrderItem[]
}
