export type UserStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE' | 'LOCKED'

export interface StaffResponse {
  id: number
  userId: number
  email: string
  phone: string | null
  userStatus: UserStatus
  branchId: number
  branchName: string
  createdAt: string
  updatedAt: string
}

export interface CreateStaffRequest {
  email: string
  password: string
  phone: string
  branchId: number
}

export interface UpdateStaffRequest {
  phone?: string
  branchId?: number
}

export interface StaffPage {
  content: StaffResponse[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'AWAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'

/** GET /api/v1/staff/schedule — one booking row in today's schedule. */
export interface StaffScheduleItem {
  bookingId: number
  courtId: number
  courtName: string
  customerName: string | null
  guestPhone: string | null
  status: BookingStatus
  date: string // YYYY-MM-DD
  startTime: string // HH:mm:ss — earliest slot start
  endTime: string // HH:mm:ss — latest slot end
  totalPrice: number
  slotCount: number
}

/** POST /api/v1/staff/checkin request body. */
export interface StaffCheckinRequest {
  staffUserId: number
  checkinCode: string
}

/** POST /api/v1/staff/checkin response payload. */
export interface StaffCheckinResponse {
  bookingId: number
  courtName: string
  customerName: string | null
  guestPhone: string | null
  status: BookingStatus
  date: string // YYYY-MM-DD
  startTime: string // HH:mm:ss
  endTime: string // HH:mm:ss
  checkedInAt: string // ISO-8601 offset datetime
}
