import type { ActiveHold } from '@/types/hold'
import { isHoldExpired } from '@/utils/hold-countdown'

const KEY = 'fcourt.activeHold'

function isActiveHold(value: unknown): value is ActiveHold {
  if (!value || typeof value !== 'object') return false
  const hold = value as Partial<ActiveHold>
  return (
    typeof hold.holdToken === 'string' &&
    typeof hold.expiresAt === 'number' &&
    typeof hold.courtId === 'number' &&
    typeof hold.date === 'string' &&
    Array.isArray(hold.slots) &&
    hold.slots.length > 0
  )
}

/** sessionStorage can throw (private mode, blocked data); the flow still works in memory. */
export function saveActiveHold(hold: ActiveHold) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(hold))
  } catch {
    // ignore
  }
}

export function clearActiveHold() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

/** Returns the hold with a stable Idempotency-Key, persisting the key before the first request. */
export function withIdempotencyKey(hold: ActiveHold, generate: () => string): ActiveHold {
  if (hold.idempotencyKey) return hold
  const next = { ...hold, idempotencyKey: generate() }
  saveActiveHold(next)
  return next
}

/** Returns the stored hold, or null when none is stored or it has already expired (and is dropped). */
export function loadActiveHold(now = Date.now()): ActiveHold | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isActiveHold(parsed) || isHoldExpired(parsed.expiresAt, now)) {
      sessionStorage.removeItem(KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}
