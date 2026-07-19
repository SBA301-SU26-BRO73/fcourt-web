export type PaymentMethod = 'CASH' | 'TRANSFER'
export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED'

/** GET /api/v1/staff/products */
export interface PosProduct {
  id: number
  name: string
  unit: string | null
  price: number
}

export interface CreateOrderItem {
  productId: number
  quantity: number
}

/** POST /api/v1/staff/orders request body. */
export interface CreateOrderRequest {
  bookingId: number | null
  paymentMethod: PaymentMethod
  items: CreateOrderItem[]
}

export interface OrderItemResponse {
  productId: number
  productName: string
  quantity: number
  priceAtOrder: number
  lineTotal: number
}

/** POST/GET /api/v1/staff/orders response payload. */
export interface OrderResponse {
  id: number
  branchId: number
  bookingId: number | null
  totalAmount: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  items: OrderItemResponse[]
  createdAt: string
  paidAt: string | null
}
