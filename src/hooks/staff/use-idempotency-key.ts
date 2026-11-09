import { useRef } from 'react'

import { newIdempotencyKey } from '@/services/booking/booking.api'

/**
 * One Idempotency-Key per attempt: asking again with the same `fingerprint` (same request) returns
 * the same key so a retry after a lost response replays instead of repeating; a different request
 * gets a fresh key. Call `clear` once the request succeeded.
 */
export function useIdempotencyKey() {
  const last = useRef<{ fingerprint: string; key: string } | null>(null)

  return {
    keyFor(fingerprint: string) {
      if (last.current?.fingerprint !== fingerprint) {
        last.current = { fingerprint, key: newIdempotencyKey() }
      }
      return last.current.key
    },
    clear() {
      last.current = null
    },
  }
}
