import { useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { isApiError } from '@/common/utils/api-error'
import { createBooking, getBookingDetail } from '@/services/booking/booking.api'
import {
  confirmFreeBooking,
  getCheckoutInfo,
  getPaymentStatus,
  uploadReceipt,
} from '@/services/payment/customer-payment.api'
import { applyVoucher } from '@/services/voucher/voucher.api'
import type { CreateBookingRequest } from '@/types/checkout'
import type { MyBooking } from '@/types/my-booking'
import { nextPollDelay } from '@/pages/payment/payment.utils'

export const checkoutKeys = {
  booking: (id: number) => ['customer-booking', id] as const,
  info: (id: number) => ['checkout-info', id] as const,
  status: (id: number) => ['payment-status', id] as const,
}

/** Never retry a 4xx: 401/403/404/409/410 are answers, not glitches. */
function retryOnlyTransient(failureCount: number, error: unknown) {
  if (isApiError(error) && error.status >= 400 && error.status < 500) return false
  return failureCount < 2
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: { payload: CreateBookingRequest; idempotencyKey: string }) =>
      createBooking(payload, idempotencyKey),
    onSuccess: (booking) => {
      queryClient.setQueryData(checkoutKeys.booking(booking.id), booking)
      void queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
    },
  })
}

export function useBookingDetail(bookingId: number | null, options: { holdToken?: string | null; refetchWhile?: (booking: MyBooking) => boolean } = {}) {
  return useQuery({
    queryKey: checkoutKeys.booking(bookingId ?? 0),
    queryFn: () => getBookingDetail(bookingId as number, options.holdToken),
    enabled: bookingId !== null,
    retry: retryOnlyTransient,
    refetchInterval: (query) => {
      const booking = query.state.data
      return booking && options.refetchWhile?.(booking) ? 4_000 : false
    },
  })
}

export function useCheckoutInfo(bookingId: number | null, holdToken?: string | null) {
  return useQuery({
    queryKey: checkoutKeys.info(bookingId ?? 0),
    queryFn: () => getCheckoutInfo(bookingId as number, holdToken),
    enabled: bookingId !== null,
    retry: retryOnlyTransient,
    staleTime: Infinity,
  })
}

export function useUploadReceipt(bookingId: number, holdToken?: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadReceipt(bookingId, file, holdToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: checkoutKeys.booking(bookingId) })
      void queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
    },
  })
}

/** Applying a code changes the payable amount, so booking and checkout-info are read again. */
export function useApplyVoucher(bookingId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { code: string; totalAmount: number }) => applyVoucher({ ...input, bookingId }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: checkoutKeys.booking(bookingId) }),
        queryClient.invalidateQueries({ queryKey: checkoutKeys.info(bookingId) }),
      ])
    },
  })
}

export function useConfirmFree(bookingId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => confirmFreeBooking(bookingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: checkoutKeys.booking(bookingId) })
      void queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
    },
  })
}

/**
 * Receipt decision polling (compact status): sequential every 4 s, exponential backoff on errors
 * up to 30 s, paused while the tab is hidden, stopped on SUCCESS/REJECTED and after 10 minutes.
 * `refetch()` is the manual check once the deadline passed. 404 means "no receipt yet".
 */
export function usePaymentStatus(bookingId: number | null, options: { enabled?: boolean; holdToken?: string | null; startedAt: number }) {
  const failures = useRef(0)
  return useQuery({
    queryKey: checkoutKeys.status(bookingId ?? 0),
    queryFn: async () => {
      try {
        const status = await getPaymentStatus(bookingId as number, options.holdToken)
        failures.current = 0
        return status
      } catch (error) {
        failures.current += 1
        throw error
      }
    },
    enabled: bookingId !== null && (options.enabled ?? true),
    retry: false,
    refetchInterval: (query) =>
      nextPollDelay({
        state: query.state.data?.paymentStatus ?? null,
        failures: failures.current,
        startedAt: options.startedAt,
        now: Date.now(),
      }),
    refetchIntervalInBackground: false,
  })
}
