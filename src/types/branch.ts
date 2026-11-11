export type BranchStatus = 'ACTIVE' | 'INACTIVE'

export interface BranchImage {
  id: number
  branchId: number
  url: string
  sortOrder: number
  createdAt: string
}

/** BranchResponse of facility-service (`GET /api/admin/branches`). */
export interface Branch {
  id: number
  adminId: number
  name: string
  address: string
  ward: string | null
  district: string | null
  city: string
  latitude: number | null
  longitude: number | null
  phone: string | null
  /** "HH:mm" */
  openTime: string
  closeTime: string
  slotDurationMinutes: 30 | 60
  bankName: string
  bankBin: string
  bankAccountNumber: string
  bankAccountName: string
  status: BranchStatus
  courtCount: number
  createdAt: string
  updatedAt: string
  images?: BranchImage[]
}

/** BranchRequest: the owner is the JWT subject, so there is no adminId. PUT is a full replacement. */
export interface BranchRequest {
  name: string
  address: string
  ward?: string | null
  district?: string | null
  city: string
  latitude?: number | null
  longitude?: number | null
  phone?: string | null
  openTime: string
  closeTime: string
  slotDurationMinutes?: 30 | 60 | null
  bankName: string
  bankBin: string
  bankAccountNumber: string
  bankAccountName: string
  status?: BranchStatus | null
}

export type CreateBranchRequest = BranchRequest
export type UpdateBranchRequest = BranchRequest

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
