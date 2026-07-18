export type CourtStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'

export interface Court {
  id: number
  branchId: number
  branchName: string
  name: string
  courtTypeId: number
  courtTypeName: string
  description: string | null
  imageUrl: string | null
  status: CourtStatus
  createdAt: string
  updatedAt: string
}

export interface CreateCourtRequest {
  branchId: number
  name: string
  courtTypeId: number
  description?: string | null
  imageUrl?: string | null
  status?: CourtStatus | null
}

export interface UpdateCourtRequest {
  name?: string | null
  courtTypeId?: number | null
  description?: string | null
  imageUrl?: string | null
  status?: CourtStatus | null
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

export type CourtSortField = 'id' | 'name' | 'status' | 'createdAt' | 'updatedAt'
export type SortDirection = 'asc' | 'desc'

export interface CourtListParams {
  page: number
  size: number
  sortField: CourtSortField
  sortDirection: SortDirection
}
