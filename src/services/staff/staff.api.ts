import { axiosClient } from '@/services/http/axios-client'
import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import type { ApiResponse } from '@/types/auth'
import type {
  StaffPage,
  StaffResponse,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffScheduleItem,
  StaffCheckinRequest,
  StaffCheckinResponse,
} from '@/types/staff'
import type {
  WalkInBookingRequest,
  WalkInBookingResponse,
  StaffCheckoutRequest,
  StaffCheckoutResponse,
} from '@/types/booking'
import type { PosProduct, CreateOrderRequest, OrderResponse } from '@/types/pos'

function requireData<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'The server returned no data.')
  }
  return response.data
}

export async function getStaffByBranch(
  branchId: number,
  page = 0,
  size = 20,
): Promise<StaffPage> {
  const { data } = await axiosClient.get<ApiResponse<StaffPage>>(
    API_ENDPOINTS.staff.listByBranch(branchId),
    { params: { page, size, sort: 'id,desc' } },
  )
  return requireData(data)
}

export async function getStaffDetail(id: number): Promise<StaffResponse> {
  const { data } = await axiosClient.get<ApiResponse<StaffResponse>>(
    API_ENDPOINTS.staff.detail(id),
  )
  return requireData(data)
}

/** The logged-in staff's own profile (id, branchId, branchName), resolved from the JWT. */
export async function getCurrentStaff(): Promise<StaffResponse> {
  const { data } = await axiosClient.get<ApiResponse<StaffResponse>>(
    API_ENDPOINTS.staff.me,
  )
  return requireData(data)
}

export async function createStaff(
  payload: CreateStaffRequest,
): Promise<StaffResponse> {
  const { data } = await axiosClient.post<ApiResponse<StaffResponse>>(
    API_ENDPOINTS.staff.create,
    payload,
  )
  return requireData(data)
}

export async function updateStaff(
  id: number,
  payload: UpdateStaffRequest,
): Promise<StaffResponse> {
  const { data } = await axiosClient.patch<ApiResponse<StaffResponse>>(
    API_ENDPOINTS.staff.update(id),
    payload,
  )
  return requireData(data)
}

export async function deleteStaff(id: number): Promise<void> {
  await axiosClient.delete(API_ENDPOINTS.staff.delete(id))
}

/**
 * Today's court schedule for the acting staff, resolved from the JWT on the backend.
 * `date` is optional (ISO date, defaults to today UTC on the backend).
 */
export async function getTodaySchedule(date?: string): Promise<StaffScheduleItem[]> {
  const { data } = await axiosClient.get<ApiResponse<StaffScheduleItem[]>>(
    API_ENDPOINTS.staff.schedule,
    { params: date ? { date } : {} },
  )
  return requireData(data)
}

/** Check a booking in by its UUID check-in code. */
export async function checkIn(
  payload: StaffCheckinRequest,
): Promise<StaffCheckinResponse> {
  const { data } = await axiosClient.post<ApiResponse<StaffCheckinResponse>>(
    API_ENDPOINTS.staff.checkin,
    payload,
  )
  return requireData(data)
}

/** Create a walk-in booking at the counter (status auto-set to CHECKED_IN). */
export async function createWalkInBooking(
  payload: WalkInBookingRequest,
): Promise<WalkInBookingResponse> {
  const { data } = await axiosClient.post<ApiResponse<WalkInBookingResponse>>(
    API_ENDPOINTS.staff.walkInBooking,
    payload,
  )
  return requireData(data)
}

/** Complete a booking — transitions CHECKED_IN → COMPLETED. */
export async function staffCheckout(
  payload: StaffCheckoutRequest,
): Promise<StaffCheckoutResponse> {
  const { data } = await axiosClient.post<ApiResponse<StaffCheckoutResponse>>(
    API_ENDPOINTS.staff.checkout,
    payload,
  )
  return requireData(data)
}

/** Active retail products for the acting staff's branch. */
export async function getPosProducts(): Promise<PosProduct[]> {
  const { data } = await axiosClient.get<ApiResponse<PosProduct[]>>(
    API_ENDPOINTS.staff.posProducts,
  )
  return requireData(data)
}

/** Create a retail order — merged into a booking, or a standalone bill. */
export async function createPosOrder(payload: CreateOrderRequest): Promise<OrderResponse> {
  const { data } = await axiosClient.post<ApiResponse<OrderResponse>>(
    API_ENDPOINTS.staff.posOrders,
    payload,
  )
  return requireData(data)
}

/** Mark a pending (bank-transfer) order as paid once the money has arrived. */
export async function confirmPosOrder(orderId: number): Promise<OrderResponse> {
  const { data } = await axiosClient.post<ApiResponse<OrderResponse>>(
    API_ENDPOINTS.staff.posOrderConfirm(orderId),
  )
  return requireData(data)
}

/** Today's (or a given date's) retail orders for the branch. */
export async function getPosOrders(date?: string): Promise<OrderResponse[]> {
  const { data } = await axiosClient.get<ApiResponse<OrderResponse[]>>(
    API_ENDPOINTS.staff.posOrders,
    { params: date ? { date } : {} },
  )
  return requireData(data)
}
