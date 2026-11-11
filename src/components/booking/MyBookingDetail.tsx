import { Ban, CreditCard, Landmark, Star } from 'lucide-react'

import { CheckinQrCard } from '@/components/booking/CheckinQrCard'
import { ZoomableImage } from '@/components/ui/image-viewer'
import { useMyBooking, useRefundState, useTicket } from '@/hooks/use-my-bookings'
import {
  REFUND_STATUS_LABELS,
  canRequestRefund,
  canReview,
  canTryCancel,
  formatClock,
  formatVnd,
  hasTicket,
  mayHaveRefund,
} from '@/pages/booking/my-booking.utils'
import type { MyBooking, Refund } from '@/types/my-booking'

interface MyBookingDetailProps {
  booking: MyBooking
  onPay: (booking: MyBooking) => void
  onCancel: (booking: MyBooking) => void
  onRefund: (booking: MyBooking, amount: number) => void
  onReview: (booking: MyBooking) => void
}

/** Expanded body of a booking card: fresh detail, ticket QR, refund state and the next actions. */
export function MyBookingDetail({ booking: listed, onPay, onCancel, onRefund, onReview }: MyBookingDetailProps) {
  const { data: detail } = useMyBooking(listed, true)
  // Cancellation is terminal; an older cached detail must not re-enable the ticket request.
  const booking = listed.status === 'CANCELLED' && detail.status !== 'CANCELLED' ? listed : detail
  const ticketQuery = useTicket(booking.id, hasTicket(booking))
  const refundQuery = useRefundState(booking.id, mayHaveRefund(booking))
  const refundState = refundQuery.data
  // The ticket endpoint is the authority; the code on the booking view is the fallback while it loads.
  const checkInCode = ticketQuery.data?.checkInCode ?? booking.checkInCode

  return (
    <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <Detail label="Cơ sở" value={booking.branchName} />
        <Detail label="Địa chỉ" value={booking.branchAddress ?? 'Chưa có địa chỉ'} />
        <Detail label="Tổng tiền" value={formatVnd(booking.totalPrice)} />
        {booking.branchPhone && <Detail label="Điện thoại" value={booking.branchPhone} />}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="font-semibold text-slate-900">{booking.courtName}</div>
        <div className="mt-1 font-mono text-xs text-slate-500">Mã booking: {booking.bookingCode}</div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
          {booking.slots.map((slot) => (
            <span key={slot.startTime} className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
              {formatClock(slot.startTime)} - {formatClock(slot.endTime)}
            </span>
          ))}
        </div>
        {booking.status === 'CANCELLED' && booking.cancellationReason && (
          <div className="mt-3 text-xs text-slate-500">Lý do hủy: {booking.cancellationReason}</div>
        )}

        <div className="mt-4">
          {hasTicket(booking) ? (
            <CheckinQrCard checkinCode={checkInCode} bookingCode={booking.bookingCode} />
          ) : refundState?.request ? (
            <RefundStatusNotice refund={refundState.request} />
          ) : null}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {booking.status === 'PENDING_PAYMENT' && (
            <button
              type="button"
              onClick={() => onPay(booking)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <CreditCard size={16} />
              Tiếp tục thanh toán
            </button>
          )}
          {canTryCancel(booking) && (
            <button
              type="button"
              onClick={() => onCancel(booking)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              <Ban size={16} />
              Yêu cầu hủy booking
            </button>
          )}
          {refundState && canRequestRefund(refundState) && (
            <button
              type="button"
              onClick={() => onRefund(booking, refundState.amount)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Landmark size={16} />
              Yêu cầu hoàn {formatVnd(refundState.amount)}
            </button>
          )}
          {canReview(booking) && (
            <button
              type="button"
              onClick={() => onReview(booking)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              <Star size={16} />
              Viết đánh giá
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function RefundStatusNotice({ refund }: { refund: Refund }) {
  const tone =
    refund.status === 'COMPLETED'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : refund.status === 'REJECTED'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-amber-200 bg-amber-50 text-amber-800'
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${tone}`}>
      <div className="font-semibold">
        Hoàn tiền {formatVnd(refund.amount)}: {REFUND_STATUS_LABELS[refund.status]}
      </div>
      <div className="mt-1 text-xs">
        {refund.bankName} - {refund.bankAccountNumber} - {refund.bankAccountName}
      </div>
      {refund.adminNote && <div className="mt-1 text-xs">Ghi chú từ chủ sân: {refund.adminNote}</div>}
      {refund.transferProofUrl && (
        <ZoomableImage
          src={refund.transferProofUrl}
          alt="Chứng từ hoàn tiền"
          buttonClassName="mt-3 block w-full cursor-zoom-in overflow-hidden rounded-lg border border-emerald-200 bg-white"
          className="max-h-72 w-full object-contain"
        />
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-0.5 font-semibold text-slate-800">{value}</div>
    </div>
  )
}
