export interface TimeSlotTemplate {
  id: number
  courtId: number
  courtName: string
  startTime: string
  endTime: string
  price: number
  dayOfWeek: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTimeSlotTemplateRequest {
  courtId: number
  startTime: string
  endTime: string
  price: number
  dayOfWeek: number
  active?: boolean | null
}

export interface UpdateTimeSlotTemplateRequest {
  startTime?: string | null
  endTime?: string | null
  price?: number | null
  dayOfWeek?: number | null
  active?: boolean | null
}

export interface ApplyTimeSlotTemplateRequest {
  sourceCourtId: number
}

export interface ApplyTimeSlotTemplateResponse {
  targetCourtId: number
  sourceCourtId: number
  copiedCount: number
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

export type TimeSlotSortField =
  | 'dayOfWeek'
  | 'startTime'
  | 'endTime'
  | 'price'
  | 'active'
  | 'createdAt'
  | 'updatedAt'

export type SortDirection = 'asc' | 'desc'

export interface TimeSlotListParams {
  page: number
  size: number
  sortField: TimeSlotSortField
  sortDirection: SortDirection
}

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: 'Chủ nhật',
  1: 'Thứ hai',
  2: 'Thứ ba',
  3: 'Thứ tư',
  4: 'Thứ năm',
  5: 'Thứ sáu',
  6: 'Thứ bảy',
}
