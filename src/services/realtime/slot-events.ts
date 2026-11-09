import type { CourtSlotChange, CourtSlotChangeType } from '@/types/hold'

const TYPES: readonly CourtSlotChangeType[] = [
  'SLOT_CHANGED',
  'HOLD_CREATED',
  'HOLD_RELEASED',
  'HOLD_EXPIRED',
  'LOCK_CREATED',
  'LOCK_REMOVED',
]
const LOCK_TYPES = ['OUT_OF_SERVICE', 'PRIVATE_EVENT'] as const
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export const slotTopic = (courtId: number) => `/topic/court-slots/${courtId}`

/**
 * Parse a STOMP frame body from `/topic/court-slots/{courtId}`. Mirrors the Flutter client:
 * oversized, malformed, foreign-court or invalid-date payloads are dropped, and an unknown
 * `type` degrades to a generic SLOT_CHANGED invalidation.
 */
export function parseSlotChange(body: string | null | undefined, courtId: number): CourtSlotChange | null {
  if (!body || body.length > 1024) return null
  try {
    const event = JSON.parse(body) as Record<string, unknown>
    if (event.courtId !== courtId) return null
    const date = event.date
    if (typeof date !== 'string' || !ISO_DATE.test(date)) return null
    const parsed = new Date(`${date}T00:00:00Z`)
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return null

    const type = TYPES.find((candidate) => candidate === event.type) ?? 'SLOT_CHANGED'
    const lockType = LOCK_TYPES.find((candidate) => candidate === event.lockType)
    return {
      courtId,
      date,
      type,
      ...(type.startsWith('LOCK_') && lockType ? { lockType } : {}),
    }
  } catch {
    return null
  }
}
