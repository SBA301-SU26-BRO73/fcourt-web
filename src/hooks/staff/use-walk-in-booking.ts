import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createWalkInBooking } from '@/services/staff/staff.api'
import type { WalkInBookingRequest, WalkInBookingResponse } from '@/types/booking'

export function useWalkInBooking() {
  const queryClient = useQueryClient()

  return useMutation<WalkInBookingResponse, unknown, WalkInBookingRequest>({
    mutationFn: createWalkInBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] })
    },
  })
}
