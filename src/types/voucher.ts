export type VoucherDiscountType = 'PERCENTAGE' | 'FIXED'

export interface Voucher {
  id: number
  branchId: number
  branchName: string
  code: string
  discountType: VoucherDiscountType
  discountValue: number
  minOrderValue: number | null
  maxDiscountValue: number | null
  usageLimit: number
  usageCount: number
  startDate: string
  expiryDate: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateVoucherRequest {
  branchId: number
  code: string
  discountType: VoucherDiscountType
  discountValue: number
  minOrderValue?: number
  maxDiscountValue?: number
  usageLimit: number
  startDate: string
  expiryDate: string
}

export interface UpdateVoucherRequest {
  discountType: VoucherDiscountType
  discountValue: number
  minOrderValue?: number
  maxDiscountValue?: number
  usageLimit: number
  startDate: string
  expiryDate: string
  active: boolean
}

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
}
