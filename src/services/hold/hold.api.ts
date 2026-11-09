import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient, SKIP_AUTH_HEADER } from '@/services/http/axios-client'
import type { HoldSlotsRequest, HoldSlotsResponse } from '@/types/hold'

/** Thrown when the hold response is malformed or already expired; it never advances checkout. */
export class InvalidHoldResponseError extends Error {
  constructor(message = 'Phản hồi giữ chỗ không hợp lệ hoặc đã hết hạn.') {
    super(message)
    this.name = 'InvalidHoldResponseError'
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Validate a hold response the way the Flutter client does: a UUID token and an expiry
 * that is a valid future instant. Returns the expiry as an absolute epoch in ms.
 */
export function parseHoldResponse(data: unknown, now = Date.now()) {
  const body = (data ?? {}) as Partial<HoldSlotsResponse>
  const expiresAt = typeof body.expiresAt === 'string' ? Date.parse(body.expiresAt) : NaN
  if (typeof body.holdToken !== 'string' || !UUID.test(body.holdToken)) throw new InvalidHoldResponseError()
  if (!Number.isFinite(expiresAt) || expiresAt <= now) throw new InvalidHoldResponseError()
  return { holdToken: body.holdToken, expiresAt, response: body as HoldSlotsResponse }
}

/** POST /api/bookings/hold-slots: public, no Authorization needed (a stale token is ignored). */
export async function holdSlots(payload: HoldSlotsRequest) {
  const { data } = await axiosClient.post<HoldSlotsResponse>(API_ENDPOINTS.bookings.holdSlots, payload)
  return parseHoldResponse(data)
}

/**
 * DELETE /api/bookings/hold-slots/{holdToken}: 204, idempotent for an unknown or expired token.
 * The hold token is the capability, so the call goes out without the session: an expired or stale
 * access token would otherwise be rejected by the gateway (401) and leave the slots held for 5 minutes.
 * A network error or 5xx is retried once.
 */
export async function releaseHold(holdToken: string) {
  const url = API_ENDPOINTS.bookings.releaseHold(holdToken)
  const send = () => axiosClient.delete(url, { headers: { [SKIP_AUTH_HEADER]: '1' } })
  try {
    await send()
  } catch (error) {
    const status = (error as { status?: number }).status
    const transient = status === undefined || status === 0 || status >= 500
    if (!transient) throw error
    await send()
  }
}
