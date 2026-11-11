import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type {
  BranchLockRequest,
  CourtLock,
  CourtLockGroup,
  CourtLockListParams,
  LockSlotsRequest,
} from '@/types/court-lock'

/** Locks of one branch (required by the backend), optionally narrowed to a court and a window. */
export async function getCourtLocks(params: CourtLockListParams) {
  const response = await axiosClient.get<CourtLock[]>(API_ENDPOINTS.courtLocks.slots, {
    params: {
      branchId: params.branchId,
      ...(params.courtId ? { courtId: params.courtId } : {}),
      ...(params.from ? { from: params.from } : {}),
      ...(params.to ? { to: params.to } : {}),
    },
  })
  return response.data
}

/** Locks one court for a window. 409 BOOKING_CONFLICT when a slot is already booked or held. */
export async function lockCourt(payload: LockSlotsRequest) {
  const response = await axiosClient.post<CourtLock>(API_ENDPOINTS.courtLocks.slots, payload)
  return response.data
}

export async function unlockCourt(lockId: number) {
  await axiosClient.delete(API_ENDPOINTS.courtLocks.slot(lockId))
}

/** Out of service / private event for a whole branch or a list of its courts; one group id. */
export async function lockBranchCourts(payload: BranchLockRequest) {
  const response = await axiosClient.post<CourtLockGroup>(API_ENDPOINTS.courtLocks.outOfService, payload)
  return response.data
}

export async function unlockGroup(groupId: string) {
  await axiosClient.delete(API_ENDPOINTS.courtLocks.group(groupId))
}
