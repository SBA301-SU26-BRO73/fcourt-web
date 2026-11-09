import { useState } from 'react'
import { AlertTriangle, Ban, Loader2 } from 'lucide-react'

import { useCancellationPolicy } from '@/hooks/use-my-bookings'
import { getApiErrorMessage } from '@/common/utils/api-error'
import { formatDateTime, formatVnd } from '@/pages/booking/my-booking.utils'
import type { MyBooking } from '@/types/my-booking'

interface CustomerCancelDialogProps {
  booking: MyBooking | null
  submitting?: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

/** Cancel dialog backed by GET /bookings/{id}/cancellation-policy; the reason is required by the API. */
export function CustomerCancelDialog({ booking, submitting = false, onClose, onConfirm }: CustomerCancelDialogProps) {
  if (!booking) return null
  return <CancelDialogBody key={booking.id} booking={booking} submitting={submitting} onClose={onClose} onConfirm={onConfirm} />
}

function CancelDialogBody({
  booking,
  submitting,
  onClose,
  onConfirm,
}: CustomerCancelDialogProps & { booking: MyBooking }) {
  const [reason, setReason] = useState('')
  const policyQuery = useCancellationPolicy(booking.id)
  const policy = policyQuery.data
  const trimmed = reason.trim()
  const disabled = submitting || !policy?.allowed || !trimmed || trimmed.length > 500

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div role="dialog" aria-label="Hủy đặt sân" className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Hủy đặt sân</h2>
            <p className="mt-1 text-sm text-slate-500">
              Mã đơn {booking.bookingCode} - {booking.courtName}
            </p>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          {policyQuery.isLoading && <div className="text-sm text-slate-400">Đang kiểm tra chính sách hủy…</div>}
          {policyQuery.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {getApiErrorMessage(policyQuery.error, 'Không thể tải chính sách hủy')}
            </div>
          )}
          {policy && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                policy.allowed
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              <div className="font-semibold">{policy.reason}</div>
              {policy.cancelBefore && (
                <div className="mt-1 text-xs">
                  Hạn hủy: {formatDateTime(policy.cancelBefore)} (trước giờ chơi {policy.cutoffHours} giờ)
                </div>
              )}
              {policy.allowed && (
                <div className="mt-1">
                  {policy.refundAmount > 0 ? (
                    <>
                      Bạn sẽ được hoàn <strong>{formatVnd(policy.refundAmount)}</strong> ({policy.refundPercent}%). Sau
                      khi hủy hãy gửi yêu cầu hoàn tiền kèm thông tin tài khoản.
                    </>
                  ) : (
                    'Đơn chưa thanh toán nên không phát sinh hoàn tiền.'
                  )}
                </div>
              )}
            </div>
          )}
          <label className="block text-sm font-semibold text-slate-700">
            Lý do hủy
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              maxLength={500}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="Nhập lý do hủy đặt sân"
            />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onConfirm(trimmed)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
            Xác nhận hủy
          </button>
        </div>
      </div>
    </div>
  )
}
