export type VoucherDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT'

/** The backend only has ACTIVE and EXPIRED; a voucher past its endDate is reported as EXPIRED. */
export type VoucherStatus = 'ACTIVE' | 'EXPIRED'

/** Voucher of voucher-service (`/api/admin/vouchers`). Money fields are plain numbers. */
export interface Voucher {
  id: number
  code: string
  branchId: number
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscountAmount: number | null
  minOrderAmount: number
  /** ISO instant */
  startDate: string
  endDate: string
  usageLimit: number
  usedCount: number
  status: VoucherStatus
}

/** Body of POST and PUT (PUT replaces the voucher; the branch must still belong to the owner). */
export interface VoucherRequest {
  code: string
  branchId: number
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscountAmount?: number | null
  minOrderAmount?: number | null
  startDate: string
  endDate: string
  usageLimit: number
  status?: VoucherStatus
}

/** Raw page of the service: `{ items, page, size, total }`, 0-based. */
export interface VoucherApiPage<T> {
  items: T[]
  page: number
  size: number
  total: number
}

/** Same page in the shape the old screens already read. */
export interface SpringPage<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface VoucherListParams {
  page: number
  size: number
  branchId?: number
}

export interface VoucherUsage {
  id: string
  voucherId: number
  bookingId: number
  userId: number
  discountAmount: number
  usedAt: string
  usedAtSource: string | null
  /** Snapshots taken when the voucher was used; null for old rows. */
  customerName: string | null
  customerPhone: string | null
  bookingCode: string | null
}

export interface VoucherUsageApiPage extends VoucherApiPage<VoucherUsage> {
  totalDiscountAmount: number
}

export interface VoucherUsagePage extends SpringPage<VoucherUsage> {
  totalDiscountAmount: number
}

export interface VoucherUsageParams {
  page: number
  size: number
  phone?: string
}

/**
 * Shape the customer booking screen still reads from the old monolith.
 * TODO(F4): replaced by POST /vouchers/apply on an existing booking.
 */
export interface LegacyVoucher {
  id: number
  branchId: number
  code: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minOrderValue: number | null
  maxDiscountValue: number | null
  usageLimit: number
  usageCount: number
  startDate: string
  expiryDate: string
  active: boolean
}
