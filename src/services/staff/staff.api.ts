import { axiosClient } from '@/services/http/axios-client'
import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { newIdempotencyKey } from '@/services/booking/booking.api'
import type {
  StaffListParams,
  StaffResponse,
  CreateStaffRequest,
  UpdateStaffRequest,
} from '@/types/staff'

const STAFF_PAGE_LIMIT = 100

/** GET /admin/staff?branchId&limit&offset answers a plain array (no total). */
export async function getStaffByBranch({ branchId, limit = STAFF_PAGE_LIMIT, offset = 0 }: StaffListParams) {
  const { data } = await axiosClient.get<StaffResponse[]>(API_ENDPOINTS.staff.list, {
    params: { branchId, limit, offset },
  })
  return data
}

/** Every staff of a branch: the list has no total, so keep reading until a short page. */
export async function getAllStaffByBranch(branchId: number) {
  const all: StaffResponse[] = []
  for (let offset = 0; ; offset += STAFF_PAGE_LIMIT) {
    const rows = await getStaffByBranch({ branchId, limit: STAFF_PAGE_LIMIT, offset })
    all.push(...rows)
    if (rows.length < STAFF_PAGE_LIMIT) return all
  }
}

/** Every write needs an Idempotency-Key; a retry of the same attempt must reuse the key. */
export async function createStaff(
  payload: CreateStaffRequest,
  idempotencyKey: string = newIdempotencyKey(),
): Promise<StaffResponse> {
  const { data } = await axiosClient.post<StaffResponse>(API_ENDPOINTS.staff.create, payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return data
}

export async function updateStaff(
  id: number,
  payload: UpdateStaffRequest,
  idempotencyKey: string = newIdempotencyKey(),
): Promise<StaffResponse> {
  const { data } = await axiosClient.put<StaffResponse>(API_ENDPOINTS.staff.update(id), payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return data
}

/** DELETE disables the staff assignment and the login account; the row stays (`active=false`). */
export async function disableStaff(
  id: number,
  idempotencyKey: string = newIdempotencyKey(),
): Promise<StaffResponse> {
  const { data } = await axiosClient.delete<StaffResponse>(API_ENDPOINTS.staff.delete(id), {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return data
}

export async function reactivateStaff(
  id: number,
  idempotencyKey: string = newIdempotencyKey(),
): Promise<StaffResponse> {
  const { data } = await axiosClient.post<StaffResponse>(API_ENDPOINTS.staff.reactivate(id), undefined, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return data
}
