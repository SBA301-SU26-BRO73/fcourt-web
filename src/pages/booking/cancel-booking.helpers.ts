import type { BookingResponse } from '@/types/booking'

export const refundRate = 0.8

export function isPaidCancellation(booking: BookingResponse | null) {
  return booking?.status === 'AWAITING_CONFIRMATION' || booking?.status === 'CONFIRMED'
}

export function canCancelFromCustomerView(booking: BookingResponse | null) {
  return (
    booking?.refundStatus !== 'PENDING' &&
    (booking?.status === 'PENDING_PAYMENT' ||
      booking?.status === 'AWAITING_CONFIRMATION' ||
      booking?.status === 'CONFIRMED')
  )
}

export function hasPendingRefund(booking: BookingResponse | null) {
  return booking?.status === 'CANCELLED' && booking.refundStatus === 'PENDING'
}

export function hasConfirmedRefund(booking: BookingResponse | null) {
  return booking?.status === 'CANCELLED' && booking.refundStatus === 'CONFIRMED'
}

export function calculateRefundAmount(amount: number) {
  return Math.round(amount * refundRate)
}

export function formatVnd(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export function getCancelSuccessDescription(booking: BookingResponse) {
  if (isPaidCancellation(booking)) {
    return 'Yêu cầu hoàn 80% đã được gửi cho admin xử lý.'
  }
  return 'Booking chưa thanh toán đã được hủy.'
}
