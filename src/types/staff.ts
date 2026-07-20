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
  startTime: string | null // HH:mm:ss — earliest slot start
  endTime: string | null // HH:mm:ss — latest slot end
  totalPrice: number
  slotCount: number
}

export type CourtBoardStatus = 'FREE' | 'PLAYING' | 'ENDING_SOON' | 'BOOKED_NOT_CHECKED_IN'

/** GET /api/v1/staff/court-board — one court's current status. */
export interface CourtBoardItem {
  courtId: number
  courtName: string
  status: CourtBoardStatus
  minutesRemaining: number | null
  bookingId: number | null
  checkinCode: string | null
  customerName: string | null
  slotStart: string | null // HH:mm:ss
  slotEnd: string | null // HH:mm:ss
}

/** POST /api/v1/staff/checkin request body. */
export interface StaffCheckinRequest {
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
