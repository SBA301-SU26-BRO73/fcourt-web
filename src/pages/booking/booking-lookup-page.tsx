import { useState, type FormEvent } from 'react'
import { Search, Calendar, MapPin, Ban } from 'lucide-react'

import { cancelGuestBooking, lookupGuestBooking } from '@/services/booking/booking.api'
import { isApiError } from '@/common/utils/api-error'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { CheckinQrCard } from '@/components/booking/CheckinQrCard'
import { GuestCancelDialog } from '@/components/booking/GuestCancelDialog'
import { GuestRefundSection } from '@/components/booking/GuestRefundSection'
import type { GuestBooking } from '@/types/booking'
import { useCountdown } from '@/hooks/use-countdown'

/** Message for a failed lookup: 404 never says whether the code or the phone was wrong; 429 says when to retry. */
export function lookupErrorMessage(error: unknown) {
  if (isApiError(error)) {
    if (error.status === 404) return 'Không tìm thấy đơn đặt sân. Kiểm tra lại mã đơn và số điện thoại.'
    if (error.status === 429) {
      const wait = error.retryAfterSeconds
      return wait
        ? `Bạn tra cứu quá nhiều lần. Vui lòng thử lại sau ${wait} giây.`
        : 'Bạn tra cứu quá nhiều lần. Vui lòng thử lại sau ít phút.'
    }
    if (error.status === 400) return 'Mã đơn (dạng FC12345678) hoặc số điện thoại (9-15 chữ số) chưa đúng định dạng.'
    return error.message
  }
  return 'Không thể tra cứu lúc này. Vui lòng thử lại.'
}

/** Message for a failed cancel: 400 means the status or the cancellation cut-off no longer allows it. */
export function cancelErrorMessage(error: unknown) {
  if (isApiError(error)) {
    if (error.status === 400) return error.message || 'Đơn này không thể hủy nữa (đã quá hạn hủy hoặc trạng thái không cho phép).'
    if (error.status === 404) return 'Không tìm thấy đơn đặt sân để hủy.'
    if (error.status === 429) return 'Bạn thao tác quá nhiều lần. Vui lòng thử lại sau ít phút.'
    return error.message
  }
  return 'Không thể hủy đơn lúc này. Vui lòng thử lại.'
}

const CANCELLABLE = ['PENDING_PAYMENT', 'AWAITING_CONFIRMATION', 'CONFIRMED']

/** Public guest lookup — no login required, just the booking code + phone. */
export function BookingLookupPage() {
  const [bookingCode, setBookingCode] = useState('')
  const [phone, setPhone] = useState('')
  const [booking, setBooking] = useState<GuestBooking | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lookedUp, setLookedUp] = useState({ code: '', phone: '' })
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [retryAt, setRetryAt] = useState<number | null>(null)
  const { isExpired } = useCountdown(retryAt)
  const coolingDown = retryAt !== null && !isExpired

  function recordRateLimit(err: unknown) {
    if (isApiError(err) && err.status === 429) setRetryAt(Date.now() + (err.retryAfterSeconds ?? 60) * 1000)
  }

  async function handleCancel(reason: string) {
    if (cancelling || coolingDown) return
    setCancelError(null)
    setCancelling(true)
    try {
      const result = await cancelGuestBooking(lookedUp.code, lookedUp.phone, reason)
      setBooking((current) => (current ? { ...current, status: 'CANCELLED', refundAmount: result.refundAmount, checkInCode: null, qrImageUrl: null } : current))
      setCancelOpen(false)
      setNotice(
        result.refundAmount && result.refundAmount > 0
          ? `Đã hủy đơn. Số tiền hoàn dự kiến: ${formatCurrency(result.refundAmount)}.`
          : 'Đã hủy đơn đặt sân.',
      )
    } catch (err) {
      recordRateLimit(err)
      setCancelError(cancelErrorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading || coolingDown) return
    setError(null)
    setNotice(null)
    setBooking(null)
    setLoading(true)
    try {
      setBooking(await lookupGuestBooking(bookingCode, phone))
      setLookedUp({ code: bookingCode, phone })
    } catch (err) {
      recordRateLimit(err)
      setError(lookupErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const first = booking?.slots[0]
  const last = booking?.slots[booking.slots.length - 1]

  return (
    <div className="mx-auto max-w-lg px-6 py-10 pb-24">
      <h1 className="mb-1 text-xl font-bold text-slate-900">Tra cứu đơn đặt sân</h1>
      <p className="mb-6 text-sm text-slate-500">
        Dành cho khách vãng lai — nhập mã đơn và số điện thoại đã dùng khi đặt sân.
      </p>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5">
        <label className="text-sm font-medium text-slate-700">
          Mã đơn
          <input
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value)}
            placeholder="VD: FC12345678"
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm uppercase outline-none focus:border-green-500"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Số điện thoại
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xxxxxxxx"
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500"
          />
        </label>
        <button
          type="submit"
          disabled={loading || coolingDown}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          <Search size={15} />
          {loading ? 'Đang tìm…' : 'Tra cứu'}
        </button>
      </form>

      {error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {booking && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <div className="font-semibold text-slate-900">{booking.courtName}</div>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={13} /> {booking.date}
                  {first && last ? ` • ${first.startTime.slice(0, 5)} - ${last.endTime.slice(0, 5)}` : ''}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {booking.branchName}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500">Tổng tiền: {formatCurrency(booking.totalPrice)}</div>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          {booking.status === 'CONFIRMED' && booking.checkInCode ? (
            <CheckinQrCard checkinCode={booking.checkInCode} bookingCode={booking.bookingCode} />
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Mã QR check-in chỉ hiển thị khi đơn đã được xác nhận.
            </div>
          )}
          {notice && (
            <div role="status" className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {notice}
            </div>
          )}
          {CANCELLABLE.includes(booking.status) && (
            <button
              type="button"
              onClick={() => {
                setCancelError(null)
                setCancelOpen(true)
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <Ban size={15} />
              Hủy đặt sân
            </button>
          )}
          <GuestCancelDialog
            open={cancelOpen}
            bookingCode={booking.bookingCode}
            courtName={booking.courtName}
            paid={booking.status === 'CONFIRMED' || booking.status === 'AWAITING_CONFIRMATION'}
            submitting={cancelling || coolingDown}
            error={cancelError}
            onClose={() => setCancelOpen(false)}
            onConfirm={handleCancel}
          />
          {booking.status === 'CANCELLED' && (booking.refundAmount ?? 0) > 0 && (
            <GuestRefundSection key={`${lookedUp.code}:${lookedUp.phone}`} identity={{ bookingCode: lookedUp.code, phone: lookedUp.phone }} amount={booking.refundAmount!} onRateLimited={setRetryAt} />
          )}
        </div>
      )}
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}
