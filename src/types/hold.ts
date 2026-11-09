/** slot-hold-engine contract (HoldRequest / HoldResponse records), see docs/api-gap-report.md F2. */

export interface HoldSlotsRequest {
  courtId: number
  /** yyyy-MM-dd */
  date: string
  /** 1..48 slot ids of one court and one day. */
  slotIds: number[]
  /** Vietnamese mobile `0[35789]xxxxxxxx`; required even for a signed-in customer. */
  guestPhone: string
}

export interface HoldSlotsResponse {
  holdToken: string
  expiresAt: string
  expiresInSeconds: number
  courtId: number
  date: string
  slotIds: number[]
}

export interface HeldSlot {
  slotId: number
  /** HH:mm */
  startTime: string
  /** HH:mm */
  endTime: string
  price: number
}

/**
 * A hold the customer owns, kept in sessionStorage so a reload, the login redirect and the
 * checkout pages can pick it up. `expiresAt` is an absolute epoch in ms, never a duration.
 */
export interface ActiveHold {
  holdToken: string
  expiresAt: number
  courtId: number
  courtName: string
  branchId: number | null
  branchName: string
  date: string
  guestPhone: string
  slots: HeldSlot[]
  /** Idempotency-Key of POST /api/bookings, created once per hold so a retry replays the same booking. */
  idempotencyKey?: string
}

export type CourtSlotChangeType =
  | 'SLOT_CHANGED'
  | 'HOLD_CREATED'
  | 'HOLD_RELEASED'
  | 'HOLD_EXPIRED'
  | 'LOCK_CREATED'
  | 'LOCK_REMOVED'

/** Public invalidation published on `/topic/court-slots/{courtId}`; it never carries tokens or ids. */
export interface CourtSlotChange {
  courtId: number
  date: string
  type: CourtSlotChangeType
  lockType?: 'OUT_OF_SERVICE' | 'PRIVATE_EVENT'
}
