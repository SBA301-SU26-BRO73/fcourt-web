import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, CreditCard, MapPin } from 'lucide-react'

import { useAuth } from '@/hooks/use-auth-context'
import { getMyBookings } from '@/services/booking/booking.api'
import { getApiErrorMessage } from '@/common/utils/api-error'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { CheckinQrCard } from '@/components/booking/CheckinQrCard'
import type { BookingResponse } from '@/types/booking'

export function MyBookingsPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    if (!isLoggedIn) navigate('/auth/login', { replace: true })
  }, [isLoggedIn, navigate])

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => getMyBookings(0, 50),
    enabled: isLoggedIn,
  })

  if (!isLoggedIn) return null

  const bookings = data?.content ?? []

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 pb-24">
      <h1 className="mb-1 text-xl font-bold text-slate-900">Lịch sử đặt sân</h1>
      <p className="mb-6 text-sm text-slate-500">Các đơn đặt sân của bạn</p>

      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
          Đang tải…
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {getApiErrorMessage(error, 'Không thể tải lịch sử đặt sân')}
        </div>
      )}

      {!isLoading && !isError && bookings.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
          Bạn chưa có đơn đặt sân nào.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {bookings.map((booking: BookingResponse) => {
          const expanded = expandedId === booking.id
          const needsPayment = booking.status === 'PENDING_PAYMENT'
          const awaitingConfirmation = booking.status === 'AWAITING_CONFIRMATION'
          return (
            <div
              key={booking.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between text-left"
                onClick={() => setExpandedId(expanded ? null : booking.id)}
              >
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
                  <div className="mt-1 font-mono text-xs text-slate-400">
                    Mã đơn: {booking.bookingCode}
                  </div>
                </div>
                <StatusBadge status={booking.status} />
              </button>

              {needsPayment && (
                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Đơn chưa được thanh toán</p>
                    <p className="mt-0.5 text-xs text-amber-700">
                      Vui lòng hoàn tất thanh toán trước khi thời gian giữ sân kết thúc.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/payment?bookingId=${booking.id}`)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    <CreditCard size={16} />
                    Tiếp tục thanh toán
                  </button>
                </div>
              )}

              {awaitingConfirmation && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-800">
                  Bạn đã gửi thanh toán. Đơn đang chờ nhân viên xác nhận.
                </div>
              )}

              {expanded && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <CheckinQrCard
                    checkinCode={booking.checkinCode}
                    bookingCode={booking.bookingCode}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
