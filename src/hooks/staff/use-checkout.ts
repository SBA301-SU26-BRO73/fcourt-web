import { useMutation, useQueryClient } from '@tanstack/react-query'

import { staffCheckout } from '@/services/staff/staff.api'
import { useStaffSession } from '@/context/staff-session'
import type { StaffCheckoutResponse } from '@/types/booking'

export function useCheckout() {
  const { staffUserId } = useStaffSession()
  const queryClient = useQueryClient()

  return useMutation<StaffCheckoutResponse, unknown, number>({
    mutationFn: (bookingId: number) => {
      if (staffUserId == null) return Promise.reject(new Error('No staff session'))
      return staffCheckout({ staffUserId, bookingId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] })
    },
  })
}
