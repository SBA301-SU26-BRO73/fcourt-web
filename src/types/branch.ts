export type BranchStatus = 'ACTIVE' | 'INACTIVE'

export interface Branch {
  id: number
  adminId: number
  adminName: string
  name: string
  address: string
  ward: string | null
  city: string
  phone: string | null
  openTime: string
  closeTime: string
  bankAccountNumber: string | null
  bankAccountName: string | null
  bankName: string | null
  bankQrImageUrl: string | null
  status: BranchStatus
  createdAt: string
  updatedAt: string
}

export interface CreateBranchRequest {
  adminId: number
  name: string
  address: string
  ward?: string | null
  city: string
  phone?: string | null
  openTime: string
  closeTime: string
  bankAccountNumber?: string | null
  bankAccountName?: string | null
  bankName?: string | null
  bankQrImageUrl?: string | null
}

export interface UpdateBranchRequest extends CreateBranchRequest {
  status: BranchStatus
}

export interface ApiResponse<T> {
  httpStatus?: number
  errorCode?: string
  data?: T
  message: string
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

export type BranchSortField = 'name' | 'city' | 'createdAt' | 'updatedAt'
export type SortDirection = 'asc' | 'desc'

export interface BranchListParams {
  page: number
  size: number
  sortField: BranchSortField
  sortDirection: SortDirection
}
