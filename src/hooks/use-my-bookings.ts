import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  cancelMyBooking,
  getCancellationPolicy,
  getMyBooking,
  getMyBookings,
  getMyTransactions,
  getTicket,
} from '@/services/booking/my-booking.api'
import { getRefundState, requestRefund } from '@/services/refund/customer-refund.api'
import { createReview, uploadReviewImages } from '@/services/review/review.api'
import type { CreateReviewPayload, MyBooking, MyBookingFilter, RefundRequestPayload } from '@/types/my-booking'

const KEY = ['my-bookings'] as const

export function useMyBookings(filter: MyBookingFilter, page: number, enabled = true) {
  return useQuery({
    queryKey: [...KEY, 'list', filter, page],
    queryFn: () => getMyBookings(filter, page),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useMyBooking(booking: MyBooking, enabled: boolean) {
  return useQuery({
    queryKey: [...KEY, 'detail', booking.id],
    queryFn: () => getMyBooking(booking.id),
    initialData: booking,
    enabled,
  })
}

export function useCancellationPolicy(bookingId: number | null) {
  return useQuery({
    queryKey: [...KEY, 'policy', bookingId],
    queryFn: () => getCancellationPolicy(bookingId as number),
    enabled: bookingId !== null,
    staleTime: 0,
  })
}

export function useTicket(bookingId: number, enabled: boolean) {
  return useQuery({
    queryKey: [...KEY, 'ticket', bookingId],
    queryFn: () => getTicket(bookingId),
    enabled,
    retry: false,
  })
}

export function useRefundState(bookingId: number, enabled: boolean) {
  return useQuery({
    queryKey: [...KEY, 'refund', bookingId],
    queryFn: () => getRefundState(bookingId),
    enabled,
    retry: false,
  })
}

export function useMyTransactions(page: number, enabled = true) {
  return useQuery({
    queryKey: ['my-transactions', page],
    queryFn: () => getMyTransactions(page),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: number; reason: string }) => cancelMyBooking(bookingId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useRequestRefund() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RefundRequestPayload) => requestRefund(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

/** Uploads the picked photos first, then creates the review with the returned URLs. */
export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ files, ...payload }: CreateReviewPayload & { files: File[] }) => {
      const imageUrls = await uploadReviewImages(files)
      return createReview({ ...payload, imageUrls })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
