import { useMutation, useQueryClient } from '@tanstack/react-query'

import { manualCheckIn, previewCheckIn, verifyCheckIn } from '@/services/staff/counter.api'
import { useIdempotencyKey } from '@/hooks/staff/use-idempotency-key'
import type { CheckInResult, TicketPreview } from '@/types/counter'

/** How the code reached the screen: scanned from a QR (verify) or typed by hand (manual). */
export type CheckInSource = 'QR' | 'MANUAL'

/** Read-only lookup of the ticket behind a code. */
export function useCheckInPreview() {
  return useMutation<TicketPreview, unknown, string>({
    mutationFn: previewCheckIn,
  })
}

/**
 * Confirms a check-in. The actor and branch come from the JWT; the Idempotency-Key is kept per
 * code so a retry after a lost response replays the same check-in.
 */
export function useCheckin() {
  const queryClient = useQueryClient()
  const keys = useIdempotencyKey()

  return useMutation<CheckInResult, unknown, { code: string; source: CheckInSource }>({
    mutationFn: ({ code, source }) => {
      const key = keys.keyFor(`${source}:${code.trim()}`)
      return source === 'QR' ? verifyCheckIn(code, key) : manualCheckIn(code, key)
    },
    onSuccess: () => {
      keys.clear()
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] })
    },
  })
}
