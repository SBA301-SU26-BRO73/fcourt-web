import { useState, type FormEvent } from 'react'
import { Ban, Search, Calendar, MapPin } from 'lucide-react'
import { toast } from 'sonner'

import { cancelBooking, lookupBooking } from '@/services/booking/booking.api'
import { getApiErrorMessage } from '@/common/utils/api-error'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { CheckinQrCard } from '@/components/booking/CheckinQrCard'
import {
  CancelBookingDialog,
  canCustomerCancelBooking,
} from '@/components/booking/CancelBookingDialog'
import type { BookingResponse, CancelBookingRequest } from '@/types/booking'

/** Public guest lookup — no login required, just the booking code + phone. */
export function BookingLookupPage() {
  const [bookingCode, setBookingCode] = useState('')
  const [phone, setPhone] = useState('')
  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBooking(null)
    setLoading(true)
    try {
      const result = await lookupBooking(bookingCode.trim().toUpperCase(), phone.trim())
      setBooking(result)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không tìm thấy đơn đặt sân. Kiểm tra lại mã đơn và số điện thoại.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(payload: CancelBookingRequest) {
    if (!booking) return
    setCancelling(true)
    try {
      const updated = await cancelBooking(booking.id, {
        ...payload,
        guestPhone: phone.trim(),
      })
      setBooking(updated)
      setCancelOpen(false)
      toast.success('Đã hủy đặt sân', {
        description:
          booking.status === 'CONFIRMED'
            ? 'Yêu cầu hoàn 80% đã được gửi cho admin xử lý.'
            : 'Booking chưa thanh toán đã được hủy.',
      })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể hủy booking'))
    } finally {
      setCancelling(false)
    }
  }

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
            placeholder="VD: FC1A2B3C"
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
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {booking.branchName}
                </span>
              </div>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <CheckinQrCard checkinCode={booking.checkinCode} bookingCode={booking.bookingCode} />
          {canCustomerCancelBooking(booking) && (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              <Ban size={16} />
              Hủy đặt sân
            </button>
          )}
        </div>
      )}

      <CancelBookingDialog
        booking={booking}
        open={cancelOpen}
        guestPhone={phone.trim()}
        submitting={cancelling}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
      />
    </div>
  )
}
