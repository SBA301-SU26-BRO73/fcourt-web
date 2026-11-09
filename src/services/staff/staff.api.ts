import { axiosClient } from '@/services/http/axios-client'
import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import type {
  StaffPage,
  StaffResponse,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffScheduleItem,
  StaffCheckinRequest,
  StaffCheckinResponse,
  CourtBoardItem,
} from '@/types/staff'
import type {
  WalkInBookingRequest,
  WalkInBookingResponse,
  StaffCheckoutRequest,
  StaffCheckoutResponse,
} from '@/types/booking'
import type { PosProduct, CreateOrderRequest, OrderResponse } from '@/types/pos'

// TODO(F11): GET /admin/staff?branchId&limit&offset (limit/offset paging, not page/size).
export async function getStaffByBranch(
  branchId: number,
  page = 0,
  size = 20,
): Promise<StaffPage> {
  const { data } = await axiosClient.get<StaffPage>(
    API_ENDPOINTS.staff.list,
    { params: { branchId, limit: size, offset: page * size } },
  )
  return data
}

// TODO(F11): no staff-by-id endpoint in the backend.
export async function getStaffDetail(id: number): Promise<StaffResponse> {
  const { data } = await axiosClient.get<StaffResponse>(
    API_ENDPOINTS.staff.detail(id),
  )
  return data
}

/** The logged-in staff's own profile (id, branchId, branchName), resolved from the JWT. */
export async function getCurrentStaff(): Promise<StaffResponse> {
  const { data } = await axiosClient.get<StaffResponse>(
    API_ENDPOINTS.staff.me,
  )
  return data
}

export async function createStaff(
  payload: CreateStaffRequest,
): Promise<StaffResponse> {
  const { data } = await axiosClient.post<StaffResponse>(
    API_ENDPOINTS.staff.create,
    payload,
  )
  return data
}

export async function updateStaff(
  id: number,
  payload: UpdateStaffRequest,
): Promise<StaffResponse> {
  const { data } = await axiosClient.put<StaffResponse>(
    API_ENDPOINTS.staff.update(id),
    payload,
  )
  return data
}

export async function deleteStaff(id: number): Promise<void> {
  await axiosClient.delete(API_ENDPOINTS.staff.delete(id))
}

/**
 * Today's court schedule for the acting staff, resolved from the JWT on the backend.
 * `date` is optional (ISO date, defaults to today UTC on the backend).
 */
export async function getTodaySchedule(date?: string): Promise<StaffScheduleItem[]> {
  const { data } = await axiosClient.get<StaffScheduleItem[]>(
    API_ENDPOINTS.staff.schedule,
    { params: date ? { date } : {} },
  )
  return data
}

/** Realtime status of every court in the acting staff's branch. */
// TODO(F13): no court board endpoint; needs facility courts joined with public slots.
export async function getCourtBoard(): Promise<CourtBoardItem[]> {
  const { data } = await axiosClient.get<CourtBoardItem[]>(
    API_ENDPOINTS.staff.courtBoard,
  )
  return data
}

/** Check a booking in by its UUID check-in code. */
export async function checkIn(
  payload: StaffCheckinRequest,
): Promise<StaffCheckinResponse> {
  const { data } = await axiosClient.post<StaffCheckinResponse>(
    // TODO(F13): check-in is verify, preview, manual with body { checkInCode }.
    API_ENDPOINTS.staff.checkinManual,
    payload,
  )
  return data
}

/** Create a walk-in booking at the counter (status auto-set to CHECKED_IN). */
export async function createWalkInBooking(
  payload: WalkInBookingRequest,
): Promise<WalkInBookingResponse> {
  const { data } = await axiosClient.post<WalkInBookingResponse>(
    API_ENDPOINTS.staff.walkInBooking,
    payload,
  )
  return data
}

/** Complete a booking — transitions CHECKED_IN → COMPLETED. */
export async function staffCheckout(
  payload: StaffCheckoutRequest,
): Promise<StaffCheckoutResponse> {
  const { data } = await axiosClient.put<StaffCheckoutResponse>(
    // TODO(F13): GET /staff/bookings/{id}/checkout-preview comes first.
    API_ENDPOINTS.staff.checkout(payload.bookingId),
  )
  return data
}

/** Active retail products for the acting staff's branch. */
export async function getPosProducts(): Promise<PosProduct[]> {
  const { data } = await axiosClient.get<PosProduct[]>(
    API_ENDPOINTS.staff.posProducts,
  )
  return data
}

/** Create a retail order — merged into a booking, or a standalone bill. */
export async function createPosOrder(payload: CreateOrderRequest): Promise<OrderResponse> {
  const { data } = await axiosClient.post<OrderResponse>(
    API_ENDPOINTS.staff.posOrders,
    payload,
  )
  return data
}

/** Mark a pending (bank-transfer) order as paid once the money has arrived. */
// TODO(F13): the backend has no separate confirm step for POS orders.
export async function confirmPosOrder(orderId: number): Promise<OrderResponse> {
  const { data } = await axiosClient.post<OrderResponse>(
    API_ENDPOINTS.staff.posOrderConfirm(orderId),
  )
  return data
}

/** Today's (or a given date's) retail orders for the branch. */
export async function getPosOrders(date?: string): Promise<OrderResponse[]> {
  const { data } = await axiosClient.get<OrderResponse[]>(
    API_ENDPOINTS.staff.posOrders,
    { params: date ? { date } : {} },
  )
  return data
}
