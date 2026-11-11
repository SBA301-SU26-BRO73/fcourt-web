import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type {
  CheckInResult,
  CheckoutPreview,
  CheckoutRequest,
  CheckoutResult,
  OfflineSnapshot,
  StaffAssignment,
  StaffBranchStatus,
  StaffCourt,
  TicketPreview,
  TodaySchedule,
  WalkInRequest,
  WalkInResult,
  WeekSchedule,
} from '@/types/counter'
import type {
  CreatePosOrderRequest,
  PosOrder,
  PosProduct,
  PosProductParams,
} from '@/types/pos'

function idempotent(key: string) {
  return { headers: { 'Idempotency-Key': key } }
}

/** GET /api/staff/me: the branch the logged-in staff is assigned to (from the JWT). */
export async function getStaffAssignment() {
  const { data } = await axiosClient.get<StaffAssignment>(API_ENDPOINTS.counter.me)
  return data
}

export async function getStaffBranch(branchId: number) {
  const { data } = await axiosClient.get<StaffBranchStatus>(API_ENDPOINTS.counter.branch(branchId))
  return data
}

export async function getStaffCourts(branchId: number) {
  const { data } = await axiosClient.get<StaffCourt[]>(API_ENDPOINTS.counter.branchCourts(branchId))
  return data
}

/** Today's schedule of the staff's branch, one entry per slot session. */
export async function getTodaySchedule() {
  const { data } = await axiosClient.get<TodaySchedule>(API_ENDPOINTS.counter.scheduleToday)
  return data
}

/** Week schedule; the server accepts 1 to 7 calendar days (yyyy-MM-dd). */
export async function getWeekSchedule(startDate: string, endDate: string) {
  const { data } = await axiosClient.get<WeekSchedule>(API_ENDPOINTS.counter.schedule, {
    params: { startDate, endDate },
  })
  return data
}

/** Read-only look at a ticket before it is confirmed. */
export async function previewCheckIn(checkInCode: string) {
  const { data } = await axiosClient.post<TicketPreview>(API_ENDPOINTS.counter.checkInPreview, {
    checkInCode: checkInCode.trim(),
  })
  return data
}

/** Check-in of a scanned QR code. */
export async function verifyCheckIn(checkInCode: string, idempotencyKey: string) {
  const { data } = await axiosClient.post<CheckInResult>(
    API_ENDPOINTS.counter.checkInVerify,
    { checkInCode: checkInCode.trim() },
    idempotent(idempotencyKey),
  )
  return data
}

/** Check-in of a code typed by hand. */
export async function manualCheckIn(checkInCode: string, idempotencyKey: string) {
  const { data } = await axiosClient.post<CheckInResult>(
    API_ENDPOINTS.counter.checkInManual,
    { checkInCode: checkInCode.trim() },
    idempotent(idempotencyKey),
  )
  return data
}

export async function getOfflineTickets() {
  const { data } = await axiosClient.get<OfflineSnapshot>(API_ENDPOINTS.counter.offlineTickets)
  return data
}

/** Replays an admission that was accepted offline; `occurredAt` is when it really happened. */
export async function replayOfflineCheckIn(permit: string, occurredAt: string, idempotencyKey: string) {
  const { data } = await axiosClient.post<CheckInResult>(
    API_ENDPOINTS.counter.checkInOffline,
    { permit, occurredAt },
    idempotent(idempotencyKey),
  )
  return data
}

export async function createWalkIn(payload: WalkInRequest, idempotencyKey: string) {
  const { data } = await axiosClient.post<WalkInResult>(
    API_ENDPOINTS.counter.walkIn,
    payload,
    idempotent(idempotencyKey),
  )
  return data
}

export async function getCheckoutPreview(bookingId: number) {
  const { data } = await axiosClient.get<CheckoutPreview>(API_ENDPOINTS.counter.checkoutPreview(bookingId))
  return data
}

/** CHECKED_IN to COMPLETED; the amounts must match the preview or the server answers 409. */
export async function checkoutBooking(bookingId: number, payload: CheckoutRequest, idempotencyKey: string) {
  const { data } = await axiosClient.put<CheckoutResult>(
    API_ENDPOINTS.counter.checkout(bookingId),
    payload,
    idempotent(idempotencyKey),
  )
  return data
}

export async function getPosProducts(params: PosProductParams = {}) {
  const { data } = await axiosClient.get<PosProduct[]>(API_ENDPOINTS.counter.posProducts, {
    params: {
      ...(params.query ? { query: params.query } : {}),
      ...(params.category ? { category: params.category } : {}),
      limit: params.limit ?? 100,
      offset: params.offset ?? 0,
    },
  })
  return data
}

/** 201 when settled, 202 (status PENDING_CHARGE) while the booking-service adds it to the bill. */
export async function createPosOrder(payload: CreatePosOrderRequest, idempotencyKey: string) {
  const { data } = await axiosClient.post<PosOrder>(
    API_ENDPOINTS.counter.posOrders,
    payload,
    idempotent(idempotencyKey),
  )
  return data
}

export async function getPosOrder(orderId: number) {
  const { data } = await axiosClient.get<PosOrder>(API_ENDPOINTS.counter.posOrder(orderId))
  return data
}

export async function getPosOrders(limit = 50, offset = 0) {
  const { data } = await axiosClient.get<PosOrder[]>(API_ENDPOINTS.counter.posOrders, {
    params: { limit, offset },
  })
  return data
}
