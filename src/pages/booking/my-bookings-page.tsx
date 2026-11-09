import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, CreditCard, MapPin, ReceiptText } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/hooks/use-auth-context'
import {
  useCancelBooking,
  useCreateReview,
  useMyBookings,
  useMyTransactions,
  useRequestRefund,
} from '@/hooks/use-my-bookings'
import { getApiErrorMessage, toastApiError } from '@/common/utils/api-error'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { CustomerCancelDialog } from '@/components/booking/CustomerCancelDialog'
import { MyBookingDetail } from '@/components/booking/MyBookingDetail'
import { RefundRequestDialog } from '@/components/booking/RefundRequestDialog'
import { ReviewDialog } from '@/components/booking/ReviewDialog'
import { FILTER_TABS, formatDateTime, formatVnd, transactionStatusLabel } from '@/pages/booking/my-booking.utils'
import type { MyBooking, MyBookingFilter } from '@/types/my-booking'

type View = MyBookingFilter | 'TRANSACTIONS'

export function MyBookingsPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [view, setView] = useState<View>('ALL')
  const [page, setPage] = useState(0)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [cancelTarget, setCancelTarget] = useState<MyBooking | null>(null)
  const [refundTarget, setRefundTarget] = useState<{ booking: MyBooking; amount: number } | null>(null)
  const [reviewTarget, setReviewTarget] = useState<MyBooking | null>(null)

  useEffect(() => {
    if (!isLoggedIn) navigate('/auth/login', { replace: true })
  }, [isLoggedIn, navigate])

  const isTransactions = view === 'TRANSACTIONS'
  const bookingsQuery = useMyBookings(isTransactions ? 'ALL' : view, page, isLoggedIn && !isTransactions)
  const transactionsQuery = useMyTransactions(page, isLoggedIn && isTransactions)
  const cancelMutation = useCancelBooking()
  const refundMutation = useRequestRefund()
  const reviewMutation = useCreateReview()

  if (!isLoggedIn) return null

  const activeQuery = isTransactions ? transactionsQuery : bookingsQuery
  const bookings = bookingsQuery.data?.content ?? []
  const transactions = transactionsQuery.data?.content ?? []
  const pageInfo = activeQuery.data
  const isEmpty = !activeQuery.isLoading && !activeQuery.isError && (isTransactions ? transactions : bookings).length === 0

  function changeView(next: View) {
    setView(next)
    setPage(0)
    setExpandedId(null)
  }

  function handleCancel(reason: string) {
    if (!cancelTarget) return
    cancelMutation.mutate(
      { bookingId: cancelTarget.id, reason },
      {
        onSuccess: (updated) => {
          toast.success('Đã hủy đặt sân', {
            description:
              (updated.refundAmount ?? 0) > 0
                ? 'Bạn có thể gửi yêu cầu hoàn tiền trong chi tiết đơn.'
                : 'Sân đã được giải phóng.',
          })
          setCancelTarget(null)
        },
        onError: (error) => toastApiError(error, 'Không thể hủy booking'),
      },
    )
  }

  function handleRefund(payload: Parameters<typeof refundMutation.mutate>[0]) {
    refundMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Đã gửi yêu cầu hoàn tiền')
        setRefundTarget(null)
      },
      onError: (error) => toastApiError(error, 'Không thể gửi yêu cầu hoàn tiền'),
    })
  }

  function handleReview(value: Parameters<typeof reviewMutation.mutate>[0]) {
    reviewMutation.mutate(value, {
      onSuccess: () => {
        toast.success('Cảm ơn bạn đã đánh giá')
        setReviewTarget(null)
      },
      onError: (error) => toastApiError(error, 'Không thể gửi đánh giá'),
    })
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 pb-24">
      <h1 className="mb-1 text-xl font-bold text-slate-900">Lịch sử đặt sân</h1>
      <p className="mb-6 text-sm text-slate-500">Các đơn đặt sân của bạn</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {[...FILTER_TABS, { value: 'TRANSACTIONS', label: 'Giao dịch' }].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => changeView(tab.value as View)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
              view === tab.value
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeQuery.isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">Đang tải…</div>
      )}

      {activeQuery.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {getApiErrorMessage(activeQuery.error, 'Không thể tải dữ liệu')}
        </div>
      )}

      {isEmpty && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
          {isTransactions ? 'Bạn chưa có giao dịch nào.' : 'Không có đơn đặt sân nào.'}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {!isTransactions &&
          bookings.map((booking) => {
            const expanded = expandedId === booking.id
            return (
              <div key={booking.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => setExpandedId(expanded ? null : booking.id)}
                >
                  <div>
                    <div className="font-semibold text-slate-900">{booking.courtName}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} /> {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} /> {booking.branchName}
                      </span>
                      <span className="flex items-center gap-1">
                        <ReceiptText size={13} /> {booking.slots.length} khung giờ
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-slate-400">Mã đơn: {booking.bookingCode}</div>
                    <div className="mt-1 text-xs font-medium text-emerald-700">
                      {expanded ? 'Ẩn chi tiết' : 'Bấm để xem chi tiết'}
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </button>

                {booking.status === 'PENDING_PAYMENT' && !expanded && (
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

                {booking.status === 'AWAITING_CONFIRMATION' && (
                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-800">
                    Bạn đã gửi thanh toán. Đơn đang chờ nhân viên xác nhận.
                  </div>
                )}

                {expanded && (
                  <MyBookingDetail
                    booking={booking}
                    onPay={(target) => navigate(`/payment?bookingId=${target.id}`)}
                    onCancel={setCancelTarget}
                    onRefund={(target, amount) => setRefundTarget({ booking: target, amount })}
                    onReview={setReviewTarget}
                  />
                )}
              </div>
            )
          })}

        {isTransactions &&
          transactions.map((transaction) => (
            <div key={transaction.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{transaction.courtName}</div>
                  <div className="mt-1 text-xs text-slate-500">{transaction.branchName}</div>
                  <div className="mt-1 font-mono text-xs text-slate-400">
                    {transaction.transactionCode} - {transaction.bookingCode}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{formatDateTime(transaction.occurredAt)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">{formatVnd(transaction.amount)}</div>
                  <div className="mt-1 text-xs font-medium text-slate-500">{transactionStatusLabel(transaction.status)}</div>
                </div>
              </div>
              {transaction.receiptImageUrl && (
                <a
                  href={transaction.receiptImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs font-medium text-emerald-700 hover:underline"
                >
                  Xem biên lai
                </a>
              )}
            </div>
          ))}
      </div>

      {pageInfo && pageInfo.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={pageInfo.first}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-slate-500">
            Trang {pageInfo.number + 1} / {pageInfo.totalPages}
          </span>
          <button
            type="button"
            disabled={pageInfo.last}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      <CustomerCancelDialog
        booking={cancelTarget}
        submitting={cancelMutation.isPending}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
      />
      <RefundRequestDialog
        booking={refundTarget?.booking ?? null}
        amount={refundTarget?.amount ?? 0}
        submitting={refundMutation.isPending}
        onClose={() => setRefundTarget(null)}
        onSubmit={handleRefund}
      />
      <ReviewDialog
        booking={reviewTarget}
        submitting={reviewMutation.isPending}
        onClose={() => setReviewTarget(null)}
        onSubmit={handleReview}
      />
    </div>
  )
}

