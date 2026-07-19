import { useMutation, useQueryClient } from '@tanstack/react-query'

import { checkIn } from '@/services/staff/staff.api'
import type { StaffCheckinResponse } from '@/types/staff'

/**
 * Check a booking in by its UUID code. `staffUserId` is resolved server-side
 * from the JWT, so callers only pass the scanned/typed code. Invalidates the
 * schedule so the booking flips to CHECKED_IN on the grid.
 */
export function useCheckin() {
  const queryClient = useQueryClient()

  return useMutation<StaffCheckinResponse, unknown, string>({
    mutationFn: (checkinCode: string) => checkIn({ checkinCode: checkinCode.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] })
    },
  })
}
