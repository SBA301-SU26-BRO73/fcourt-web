import { useMutation, useQueryClient } from '@tanstack/react-query'

import { staffCheckout } from '@/services/staff/staff.api'
import type { StaffCheckoutResponse } from '@/types/booking'

export function useCheckout() {
  const queryClient = useQueryClient()

  return useMutation<StaffCheckoutResponse, unknown, number>({
    mutationFn: (bookingId: number) => staffCheckout({ bookingId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] })
    },
  })
}
