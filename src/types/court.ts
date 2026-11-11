export type CourtStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'

/** CourtResponse of facility-service. */
export interface CourtDto {
  id: number
  branchId: number
  name: string
  courtTypeId: number
  description: string | null
  imageUrl: string | null
  defaultPricePerHour: number
  status: CourtStatus
  createdAt: string
  updatedAt: string
}

/** The response carries no names, so the API module adds them from the branch and the court type. */
export interface Court extends CourtDto {
  /** Taken from the branch: the court itself has no slot length. */
  slotDurationMinutes: 30 | 60
  branchName: string
  courtTypeName: string
}

/** CourtRequest: branchId lives in the path; PUT is a full replacement. */
export interface CourtRequest {
  name: string
  courtTypeId: number
  description?: string | null
  imageUrl?: string | null
  defaultPricePerHour: number
  status?: CourtStatus | null
}

export type CreateCourtRequest = CourtRequest
export type UpdateCourtRequest = CourtRequest

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
