import { useRef } from 'react'

import { newIdempotencyKey } from '@/services/booking/booking.api'

/**
 * One Idempotency-Key per distinct payload: a retry of the same form (for example after a lost
 * response) reuses the key, while an edited payload gets a fresh one.
 */
export function useIdempotencyKey() {
  const last = useRef<{ fingerprint: string; key: string } | null>(null)
  return (payload: unknown) => {
    const fingerprint = JSON.stringify(payload)
    if (last.current?.fingerprint !== fingerprint) {
      last.current = { fingerprint, key: newIdempotencyKey() }
    }
    return last.current.key
  }
}
