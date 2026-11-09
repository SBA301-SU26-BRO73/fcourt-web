import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  approvePayment,
  cancelAdminBooking,
  getAdminBookings,
  rejectPayment,
} from '@/services/admin/booking.service'
import {
  cancelFullCourt,
  createFullCourt,
  listFullCourt,
  quoteFullCourt,
  relockFullCourt,
} from '@/services/admin/full-court.service'
import { getCourtsByBranch } from '@/services/court/court.api'
import { getLedger, getPendingPayments } from '@/services/payment/payment.api'
import { approveRefund, completeRefund, getPendingRefunds, rejectRefund } from '@/services/refund/refund.api'
import type {
  AdminBookingParams,
  BookingStatus,
  FullCourtRequest,
  FullCourtState,
  FullCourtWindow,
} from '@/types/admin-booking'
import type { LedgerParams } from '@/types/payment'

export const BOOKINGS_KEY = ['admin-bookings'] as const
export const PAYMENTS_KEY = ['admin-payments'] as const
export const REFUNDS_KEY = ['admin-refunds'] as const
export const FULL_COURT_KEY = ['admin-full-court'] as const

export function useAdminBookings(params: AdminBookingParams, enabled = true) {
  return useQuery({
    queryKey: [...BOOKINGS_KEY, 'list', params],
    queryFn: () => getAdminBookings(params),
    placeholderData: keepPreviousData,
    enabled,
  })
}

const COUNTED_STATUSES: Array<BookingStatus | undefined> = [undefined, 'AWAITING_CONFIRMATION', 'CONFIRMED', 'CANCELLED']

/** Totals for the stat cards: one size-1 request per status, the server reports `total`. */
export function useBookingCounts(branchId: number | undefined) {
  const results = useQueries({
    queries: COUNTED_STATUSES.map((status) => ({
      queryKey: [...BOOKINGS_KEY, 'count', branchId, status ?? 'ALL'],
      queryFn: () => getAdminBookings({ branchId, status, page: 0, size: 1 }),
      enabled: branchId !== undefined,
    })),
  })
  const total = (index: number) => results[index]?.data?.totalElements ?? 0
  return { all: total(0), awaiting: total(1), confirmed: total(2), cancelled: total(3) }
}

/** Pending payments of one branch, needed to turn a booking into a paymentId. */
export function usePendingPayments(branchId: number | undefined) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, 'pending', branchId],
    queryFn: () => getPendingPayments(branchId as number),
    enabled: branchId !== undefined,
  })
}

export function useLedger(params: LedgerParams | null) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, 'ledger', params],
    queryFn: () => getLedger(params as LedgerParams),
    placeholderData: keepPreviousData,
    enabled: params !== null,
  })
}

export function usePendingRefunds(branchId: number | undefined, page: number, size = 10) {
  return useQuery({
    queryKey: [...REFUNDS_KEY, 'pending', branchId, page, size],
    queryFn: () => getPendingRefunds({ branchId: branchId as number, page, size }),
    placeholderData: keepPreviousData,
    enabled: branchId !== undefined,
  })
}

function useInvalidateAll() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([BOOKINGS_KEY, PAYMENTS_KEY, REFUNDS_KEY, FULL_COURT_KEY].map((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    ))
}

export function useApprovePayment() {
  const invalidate = useInvalidateAll()
  return useMutation({ mutationFn: (paymentId: number) => approvePayment(paymentId), onSuccess: invalidate })
}

export function useRejectPayment() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: number; reason: string }) => rejectPayment(paymentId, reason),
    onSuccess: invalidate,
  })
}

export function useCancelBooking() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: number; reason: string }) => cancelAdminBooking(bookingId, reason),
    onSuccess: invalidate,
  })
}

export function useApproveRefund() {
  const invalidate = useInvalidateAll()
  return useMutation({ mutationFn: (refundId: number) => approveRefund(refundId), onSuccess: invalidate })
}

export function useRejectRefund() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: ({ refundId, reason }: { refundId: number; reason: string }) => rejectRefund(refundId, reason),
    onSuccess: invalidate,
  })
}

export function useCompleteRefund() {
  const invalidate = useInvalidateAll()
  return useMutation({ mutationFn: completeRefund, onSuccess: invalidate })
}

export function useBranchCourts(branchId: number | undefined) {
  return useQuery({
    queryKey: ['branch-courts', branchId],
    queryFn: () => getCourtsByBranch(branchId as number),
    enabled: branchId !== undefined,
  })
}

export function useFullCourtPackages(params: { state?: FullCourtState; page: number; size: number }) {
  return useQuery({
    queryKey: [...FULL_COURT_KEY, 'list', params],
    queryFn: () => listFullCourt(params),
    placeholderData: keepPreviousData,
  })
}

export function useQuoteFullCourt() {
  return useMutation({ mutationFn: (window: FullCourtWindow) => quoteFullCourt(window) })
}

export function useCreateFullCourt() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: ({ request, key }: { request: FullCourtRequest; key: string }) => createFullCourt(request, key),
    onSuccess: invalidate,
  })
}

export function useCancelFullCourt() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: ({ packageId, reason }: { packageId: string; reason: string }) => cancelFullCourt(packageId, reason),
    onSuccess: invalidate,
  })
}

export function useRelockFullCourt() {
  const invalidate = useInvalidateAll()
  return useMutation({ mutationFn: (packageId: string) => relockFullCourt(packageId), onSuccess: invalidate })
}
