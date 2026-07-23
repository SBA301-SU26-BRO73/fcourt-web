import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Ban, Calendar, CreditCard, MapPin, ReceiptText } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/use-auth-context'
import { cancelBooking, getMyBookings } from '@/services/booking/booking.api'
import { getApiErrorMessage } from '@/common/utils/api-error'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { CheckinQrCard } from '@/components/booking/CheckinQrCard'
import {
  CancelBookingDialog,
  canCustomerCancelBooking,
} from '@/components/booking/CancelBookingDialog'
import type { BookingResponse, CancelBookingRequest } from '@/types/booking'
import {
  getCancelSuccessDescription,
  hasPendingRefund,
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
    refetchInterval: 5000,
  })

  if (!isLoggedIn) return null

  const bookings = data?.content ?? []
  const bookingGroups = groupBookings(bookings)

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

  function openCancelDialog(booking: BookingResponse) {
    setCancelTarget(booking)
    setRefundAmount(booking.refundAmount ?? null)
    setRefundPreviewLoading(false)

    setRefundPreviewError(
      isPaidCancellation(booking) && booking.refundAmount == null
        ? 'Không tìm thấy dữ liệu thanh toán để tính số tiền hoàn.'
        : null,
    )
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
        {bookingGroups.map((group) => {
          const expanded = expandedId === group.id
          return (
            <div
              key={group.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between text-left"
                onClick={() => setExpandedId(expanded ? null : group.id)}
              >
                <div>
                  <div className="font-semibold text-slate-900">{group.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {group.dateLabel}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {group.branchName}
                    </span>
                    <span className="flex items-center gap-1">
                      <ReceiptText size={13} /> {group.slotCount} khung giờ
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-xs text-slate-400">
                    {group.paymentId ? `Thanh toán #${group.paymentId}` : `Mã đơn: ${group.items[0].bookingCode}`}
                  </div>
                  <div className="mt-1 text-xs font-medium text-emerald-700">
                    {expanded ? 'Ẩn chi tiết' : 'Bấm để xem chi tiết'}
                  </div>
                </div>
                <StatusBadge status={group.status} />
              </button>

              {expanded && (
                <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <Detail label="Cơ sở" value={group.branchName} />
                    <Detail label="Tổng tiền" value={formatCurrency(group.totalPrice)} />
                  </div>

                  {group.items.map((booking) => (
                    <div key={booking.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{booking.courtName}</div>
                          <div className="mt-1 font-mono text-xs text-slate-500">
                            Mã booking: {booking.bookingCode}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                            {booking.slots.map((slot) => (
                              <span
                                key={slot.id}
                                className="rounded-full border border-slate-200 bg-white px-2.5 py-1"
                              >
                                {formatTime(slot.slotStart)} - {formatTime(slot.slotEnd)}
                              </span>
                            ))}
                          </div>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="mt-4">
                        {hasPendingRefund(booking) ? (
                          <RefundPendingNotice refundAmount={booking.refundAmount} />
                        ) : (
                          <CheckinQrCard
                            checkinCode={booking.checkinCode}
                            bookingCode={booking.bookingCode}
                          />
                        )}
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {booking.status === 'PENDING_PAYMENT' && (
                          <button
                            type="button"
                            onClick={() => navigate(`/payment?bookingId=${booking.id}`)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            <CreditCard size={16} />
                            Tiếp tục thanh toán
                          </button>
                        )}
                        {canCustomerCancelBooking(booking) && (
                          <button
                            type="button"
                            onClick={() => openCancelDialog(booking)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
                          >
                            <Ban size={16} />
                            Yêu cầu hủy booking
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
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

interface BookingGroup {
  id: number
  paymentId: number | null
  title: string
  branchName: string
  dateLabel: string
  status: BookingResponse['status']
  totalPrice: number
  slotCount: number
  items: BookingResponse[]
}

function groupBookings(bookings: BookingResponse[]): BookingGroup[] {
  return bookings.map((booking) => {
    return {
      id: booking.id,
      paymentId: booking.paymentId,
      title: booking.courtName,
      branchName: booking.branchName,
      dateLabel: booking.date,
      status: booking.status,
      totalPrice: booking.totalPrice,
      slotCount: booking.slots.length,
      items: [booking],
    }
  })
}

function RefundPendingNotice({ refundAmount }: { refundAmount: number | null }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Booking đã được hủy và đang chờ admin chuyển khoản hoàn tiền
      {refundAmount != null ? ` ${formatCurrency(refundAmount)}` : ''}, sau đó xác nhận hoàn tất.
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

function formatTime(value: string) {
  return value.slice(0, 5)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}
