import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type {
  FullCourtPackage,
  FullCourtQuote,
  FullCourtRequest,
  FullCourtResult,
  FullCourtState,
  FullCourtWindow,
} from '@/types/admin-booking'

function windowOf(request: FullCourtWindow): FullCourtWindow {
  return {
    branchId: request.branchId,
    courtIds: request.courtIds,
    date: request.date,
    startTime: request.startTime,
    endTime: request.endTime,
  }
}

function toResult(status: number, pkg: FullCourtPackage): FullCourtResult {
  return { pkg, pending: status === 202 }
}

/** Server priced preview; it does not hold anything. */
export async function quoteFullCourt(window: FullCourtWindow) {
  const response = await axiosClient.post<FullCourtQuote>(API_ENDPOINTS.bookings.fullCourt.quote, windowOf(window))
  return response.data
}

/** 201 created, 200 replay of the same key, 202 booked but the lock commit is still pending. */
export async function createFullCourt(request: FullCourtRequest, idempotencyKey: string) {
  const response = await axiosClient.post<FullCourtPackage>(
    API_ENDPOINTS.bookings.fullCourt.root,
    { ...windowOf(request), contactName: request.contactName.trim(), contactPhone: request.contactPhone.trim() },
    { headers: { 'Idempotency-Key': idempotencyKey } },
  )
  return toResult(response.status, response.data)
}

/** Packages of the owner's branches, newest first; `state=LOCK_LOST` is the relock queue. */
export async function listFullCourt(params: { state?: FullCourtState; page: number; size: number }) {
  const response = await axiosClient.get<FullCourtPackage[]>(API_ENDPOINTS.bookings.fullCourt.root, {
    params: { page: params.page, size: params.size, ...(params.state ? { state: params.state } : {}) },
  })
  return response.data
}

export async function getFullCourt(packageId: string) {
  const response = await axiosClient.get<FullCourtPackage>(API_ENDPOINTS.bookings.fullCourt.detail(packageId))
  return response.data
}

/** 200 cancelled; 202 bookings cancelled but the lock release is still pending (retry). */
export async function cancelFullCourt(packageId: string, reason: string) {
  const response = await axiosClient.post<FullCourtPackage>(API_ENDPOINTS.bookings.fullCourt.cancel(packageId), {
    reason: reason.trim(),
  })
  return toResult(response.status, response.data)
}

/** Repair for a package whose lock was lost. */
export async function relockFullCourt(packageId: string) {
  const response = await axiosClient.post<FullCourtPackage>(API_ENDPOINTS.bookings.fullCourt.relock(packageId))
  return toResult(response.status, response.data)
}
