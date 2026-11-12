import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { isApiError } from '@/common/utils/api-error'
import { lookupGuestRefund, requestGuestRefund, type GuestRefundIdentity, type GuestRefundPayload } from '@/services/refund/guest-refund.api'
import type { RefundState } from '@/types/my-booking'

export function useGuestRefund(identity: GuestRefundIdentity, onRateLimited?: (deadline: number) => void) {
  const client = useQueryClient()
  const [retryAt, setRetryAt] = useState<number | null>(null)
  function onError(error: unknown) {
    if (isApiError(error) && error.status === 429) {
      const deadline = Date.now() + (error.retryAfterSeconds ?? 60) * 1000
      setRetryAt(deadline)
      onRateLimited?.(deadline)
    }
  }
  const queryKey = ['guest-refund', identity.bookingCode, identity.phone]
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await lookupGuestRefund(identity)
      } catch (error) {
        onError(error)
        throw error
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: 0,
  })
  const mutation = useMutation({
    mutationFn: (payload: GuestRefundPayload) => requestGuestRefund(payload),
    retry: false,
    onError,
    onSuccess: (request) => {
      client.setQueryData<RefundState>(queryKey, {
        bookingId: request.bookingId,
        amount: request.amount,
        eligible: request.status === 'PENDING',
        request,
      })
    },
  })
  return { query, mutation, retryAt }
}
