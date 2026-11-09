import type { ActiveHold } from '@/types/hold'
import type { CourtSlot } from '@/types/public-branch'

/**
 * The server has no "get my hold" endpoint, so a restored hold is checked against the public slot
 * grid: a slot of our own hold is reported as HOLD. If the grid was fetched after the hold was
 * created and one of its slots is AVAILABLE or BOOKED, the hold was released, expired or sealed
 * elsewhere, and the cached copy must be dropped. Older data proves nothing.
 */
export function isHoldOutdated(hold: ActiveHold, slots: CourtSlot[] | undefined, fetchedAt: number): boolean {
  if (!slots || slots.length === 0) return false
  if (fetchedAt <= (hold.savedAt ?? 0)) return false
  const byId = new Map(slots.map((slot) => [slot.slotId, slot.status]))
  return hold.slots.some((held) => {
    const status = byId.get(held.slotId)
    return status === 'AVAILABLE' || status === 'BOOKED'
  })
}
