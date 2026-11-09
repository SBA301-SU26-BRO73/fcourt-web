/** Front-desk contracts of staff-operations-service, facility-service (staff routes) and pos-retail-service (F13). */

/** GET /api/staff/me (StaffView): the acting staff's own assignment. */
export interface StaffAssignment {
  id: number
  userId: number
  branchId: number
  email: string
  fullName: string
  phone: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

/** GET /api/staff/branches/{id} (BranchResponse.Status). */
export interface StaffBranchStatus {
  id: number
  status: string
}

/** GET /api/staff/branches/{id}/courts (CourtResponse.ScheduleView). */
export interface StaffCourt {
  id: number
  branchId: number
  name: string
  status: string
}

/** One slot session of a booking. `status` is a booking status; times are HH:mm:ss. */
export interface ScheduleSession {
  bookingId: number
  date: string
  slotStart: string
  slotEnd: string
  status: string
  customerName: string | null
  guestPhone: string | null
}

/** GET /api/staff/schedule/today */
export interface TodaySchedule {
  branchId: number
  courts: Array<{ courtId: number; courtName: string; slots: ScheduleSession[] }>
}

export interface WeekScheduleFlags {
  lateCheckIn: boolean
  playing: boolean
  endingSoon: boolean
}

export interface WeekScheduleEntry {
  bookingId: number
  slotStart: string
  slotEnd: string
  status: string
  customerName: string | null
  guestPhone: string | null
  flags: WeekScheduleFlags
}

/** GET /api/staff/schedule?startDate&endDate (1 to 7 days, Monday first on the screen). */
export interface WeekSchedule {
  branchId: number
  startDate: string
  endDate: string
  generatedAt: string
  courts: Array<{
    courtId: number
    courtName: string
    days: Array<{ date: string; slots: WeekScheduleEntry[] }>
  }>
}

/** POST /api/staff/check-in/preview: what the ticket is for, nothing is changed. */
export interface TicketPreview {
  bookingId: number
  branchId: number
  courtId: number
  courtName: string
  date: string
  slotStart: string
  slotEnd: string
  status: string
  customerName: string | null
  guestPhone: string | null
}

/** POST /api/staff/check-in/{verify,manual,offline} */
export interface CheckInResult {
  bookingId: number
  branchId: number
  date: string
  status: string
  checkedInAt: string
}

/** GET /api/staff/offline/tickets: signed permits for today's CONFIRMED bookings. */
export interface OfflineTicket {
  bookingId: number
  /** SHA-256 hex of the check-in code. */
  codeHash: string
  courtName: string
  customerName: string | null
  validFrom: string
  validUntil: string
  permit: string
}

export interface OfflineSnapshot {
  userId: number
  branchId: number
  date: string
  generatedAt: string
  tickets: OfflineTicket[]
}

/** An offline check-in waiting to be replayed; the key makes the replay idempotent. */
export interface PendingOfflineCheckIn {
  idempotencyKey: string
  bookingId: number
  courtName: string
  customerName: string | null
  permit: string
  occurredAt: string
}

export interface WalkInRequest {
  courtId: number
  /** yyyy-MM-dd */
  date: string
  slotIds: number[]
  guestPhone: string
  guestName?: string
}

export interface ChargedSlot {
  slotId: number
  startTime: string
  endTime: string
  price: number
}

export interface CashInvoice {
  receiptCode: string
  cashierUserId: number
  baseAmount: number
  surchargeAmount: number
  totalAmount: number
  policyVersion: string
  items: ChargedSlot[]
}

/** POST /api/staff/walk-in: a CHECKED_IN booking paid in cash at the counter. */
export interface WalkInResult {
  bookingId: number
  bookingCode: string
  branchId: number
  courtId: number
  date: string
  status: string
  paymentMethod: string
  amount: number
  checkedInAt: string
  invoice: CashInvoice
}

/** GET /api/staff/bookings/{id}/checkout-preview */
export interface CheckoutPreview {
  bookingId: number
  branchId: number
  surchargeAmount: number
  totalAmount: number
  posAmount: number
}

/** PUT /api/staff/bookings/{id}/checkout body: the amounts the staff saw in the preview. */
export interface CheckoutRequest {
  expectedSurcharge: number
  expectedTotal: number
}

export interface CheckoutResult {
  bookingId: number
  branchId: number
  status: string
  completedAt: string
}
