import { useState, type FormEvent } from 'react'
import { Search, Calendar, MapPin } from 'lucide-react'

import { lookupGuestBooking } from '@/services/booking/booking.api'
import { isApiError } from '@/common/utils/api-error'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { CheckinQrCard } from '@/components/booking/CheckinQrCard'
import type { GuestBooking } from '@/types/booking'

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

/** Public guest lookup — no login required, just the booking code + phone. */
export function BookingLookupPage() {
  const [bookingCode, setBookingCode] = useState('')
  const [phone, setPhone] = useState('')
  const [booking, setBooking] = useState<GuestBooking | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    setError(null)
    setBooking(null)
    setLoading(true)
    try {
      setBooking(await lookupGuestBooking(bookingCode, phone))
    } catch (err) {
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
          disabled={loading}
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
