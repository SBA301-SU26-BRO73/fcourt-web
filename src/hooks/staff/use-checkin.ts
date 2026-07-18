import { useMutation, useQueryClient } from '@tanstack/react-query'

import { checkIn } from '@/services/staff/staff.api'
import { useStaffSession } from '@/context/staff-session'
import type { StaffCheckinResponse } from '@/types/staff'

/**
 * Check a booking in by its UUID code. Pulls `staffUserId` from the session so
 * callers only pass the scanned/typed code. Invalidates the schedule so the
 * booking flips to CHECKED_IN on the grid.
 */
export function useCheckin() {
  const { staffUserId } = useStaffSession()
  const queryClient = useQueryClient()

  return useMutation<StaffCheckinResponse, unknown, string>({
    mutationFn: (checkinCode: string) => {
      if (staffUserId == null) {
        return Promise.reject(new Error('No staff session'))
      }
      return checkIn({ staffUserId, checkinCode: checkinCode.trim() })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] })
    },
  })
}
