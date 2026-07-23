import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Ban, Calendar, CreditCard, MapPin } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/use-auth-context'
import { cancelBooking, getMyBookings, getPaymentDetails } from '@/services/booking/booking.api'
import { getApiErrorMessage } from '@/common/utils/api-error'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { CheckinQrCard } from '@/components/booking/CheckinQrCard'
import {
  CancelBookingDialog,
  canCustomerCancelBooking,
} from '@/components/booking/CancelBookingDialog'
import type { BookingResponse, CancelBookingRequest } from '@/types/booking'
import {
  calculateRefundAmount,
  getCancelSuccessDescription,
  isPaidCancellation,
} from '@/pages/booking/cancel-booking.helpers'

export function MyBookingsPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [cancelTarget, setCancelTarget] = useState<BookingResponse | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [refundAmount, setRefundAmount] = useState<number | null>(null)
  const [refundPreviewLoading, setRefundPreviewLoading] = useState(false)
  const [refundPreviewError, setRefundPreviewError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn) navigate('/auth/login', { replace: true })
  }, [isLoggedIn, navigate])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => getMyBookings(0, 50),
    enabled: isLoggedIn,
  })

  if (!isLoggedIn) return null

  const bookings = data?.content ?? []

  async function handleCancel(payload: CancelBookingRequest) {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await cancelBooking(cancelTarget.id, payload)
      toast.success('Đã hủy đặt sân', {
        description: getCancelSuccessDescription(cancelTarget),
      })
      setCancelTarget(null)
      await refetch()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể hủy booking'))
    } finally {
      setCancelling(false)
    }
  }

  async function openCancelDialog(booking: BookingResponse) {
    setCancelTarget(booking)
    setRefundAmount(null)
    setRefundPreviewError(null)

    if (!isPaidCancellation(booking)) return
    if (!booking.paymentId) {
      setRefundPreviewError('Không tìm thấy mã thanh toán, số tiền hiển thị đang tạm tính theo giá booking.')
      return
    }

    setRefundPreviewLoading(true)
    try {
      const payment = await getPaymentDetails(booking.paymentId)
      setRefundAmount(calculateRefundAmount(payment.amount))
    } catch {
      setRefundPreviewError('Không tải được payment, số tiền hiển thị đang tạm tính theo giá booking.')
    } finally {
      setRefundPreviewLoading(false)
    }
  }

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

              {expanded && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <CheckinQrCard
                    checkinCode={booking.checkinCode}
                    bookingCode={booking.bookingCode}
                  />
                  {booking.status === 'PENDING_PAYMENT' && (
                    <button
                      type="button"
                      onClick={() => navigate(`/payment?bookingId=${booking.id}`)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <CreditCard size={16} />
                      Tiếp tục thanh toán
                    </button>
                  )}
                  {canCustomerCancelBooking(booking) && (
                    <button
                      type="button"
                      onClick={() => openCancelDialog(booking)}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      <Ban size={16} />
                      Hủy đặt sân
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <CancelBookingDialog
        booking={cancelTarget}
        open={!!cancelTarget}
        refundAmount={refundAmount}
        refundPreviewLoading={refundPreviewLoading}
        refundPreviewError={refundPreviewError}
        submitting={cancelling}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
      />
    </div>
  )
}
