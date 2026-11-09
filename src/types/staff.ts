/** One weekly work shift; `dayOfWeek` is ISO (Monday=1 ... Sunday=7), times are HH:mm. */
export interface StaffShift {
  dayOfWeek: number
  startTime: string
  endTime: string
}

/** staff-operations-service `StaffView` (GET/POST/PUT /admin/staff, GET /staff/me). */
export interface StaffResponse {
  id: number
  userId: number
  branchId: number
  email: string
  fullName: string
  phone: string | null
  active: boolean
  createdAt: string
  updatedAt: string
  shifts: StaffShift[]
  /** Not sent by the new backend; kept optional for the staff session header (F13). */
  branchName?: string | null
}

/** POST /admin/staff. The password is the temporary one the owner hands over (12-72 chars). */
export interface CreateStaffRequest {
  branchId: number
  email: string
  password: string
  fullName: string
  phone: string
  shifts: StaffShift[]
}

/** PUT /admin/staff/{id}: email and branch cannot change. */
export interface UpdateStaffRequest {
  fullName: string
  phone: string
  shifts: StaffShift[]
}

export interface StaffListParams {
  branchId: number
  limit?: number
  offset?: number
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
