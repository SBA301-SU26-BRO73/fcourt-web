import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { checkoutBooking, getCheckoutPreview } from '@/services/staff/counter.api'
import { useIdempotencyKey } from '@/hooks/staff/use-idempotency-key'
import type { CheckoutPreview, CheckoutResult } from '@/types/counter'

/** The amounts due at checkout (surcharge, POS total); always fetched fresh. */
export function useCheckoutPreview(bookingId: number) {
  return useQuery<CheckoutPreview>({
    queryKey: ['checkout-preview', bookingId],
    queryFn: () => getCheckoutPreview(bookingId),
    enabled: Number.isFinite(bookingId) && bookingId > 0,
    staleTime: 0,
    gcTime: 0,
  })
}

/** Completes the booking with the amounts the staff saw; the server refuses (409) if they changed. */
export function useCheckout() {
  const queryClient = useQueryClient()
  const keys = useIdempotencyKey()

  return useMutation<CheckoutResult, unknown, CheckoutPreview>({
    mutationFn: (preview) =>
      checkoutBooking(
        preview.bookingId,
        { expectedSurcharge: preview.surchargeAmount, expectedTotal: preview.totalAmount },
        keys.keyFor(`${preview.bookingId}:${preview.surchargeAmount}:${preview.totalAmount}`),
      ),
    onSuccess: (_result, preview) => {
      keys.clear()
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] })
      queryClient.removeQueries({ queryKey: ['checkout-preview', preview.bookingId] })
    },
  })
}
