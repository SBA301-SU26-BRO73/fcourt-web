import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Ban, Loader2 } from 'lucide-react'

import type { BookingResponse, CancelBookingRequest } from '@/types/booking'
import {
  canCancelFromCustomerView,
  formatVnd,
  isPaidCancellation,
} from '@/pages/booking/cancel-booking.helpers'

interface CancelBookingDialogProps {
  booking: BookingResponse | null
  open: boolean
  guestPhone?: string
  refundAmount?: number | null
  refundPreviewLoading?: boolean
  refundPreviewError?: string | null
  submitting?: boolean
  onClose: () => void
  onConfirm: (payload: CancelBookingRequest) => Promise<void> | void
}

export function CancelBookingDialog({
  booking,
  open,
  guestPhone,
  refundAmount: providedRefundAmount,
  refundPreviewLoading = false,
  refundPreviewError,
  submitting = false,
  onClose,
  onConfirm,
}: CancelBookingDialogProps) {
  const [reason, setReason] = useState('')
  const [refundBankName, setRefundBankName] = useState('')
  const [refundBankAccountNumber, setRefundBankAccountNumber] = useState('')
  const [refundBankAccountName, setRefundBankAccountName] = useState('')

  useEffect(() => {
    if (!open) {
      setReason('')
      setRefundBankName('')
      setRefundBankAccountNumber('')
      setRefundBankAccountName('')
    }
  }, [open])

  const previewRefundAmount = useMemo(
    () => providedRefundAmount ?? booking?.refundAmount ?? null,
    [booking?.refundAmount, providedRefundAmount],
  )

  if (!open || !booking) return null

  const requiresRefundInfo = isPaidCancellation(booking)
  const disabled =
    submitting ||
    !canCancelFromCustomerView(booking) ||
    (requiresRefundInfo &&
      (!reason.trim() ||
        !refundBankName.trim() ||
        !refundBankAccountNumber.trim() ||
        !refundBankAccountName.trim()))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
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
          {requiresRefundInfo ? (
            <>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Booking đã thanh toán. Sau khi hủy, sân được giải phóng ngay và admin sẽ hoàn{' '}
                <strong>
                  {refundPreviewLoading
                    ? 'đang tính...'
                    : previewRefundAmount == null
                      ? 'chưa có dữ liệu'
                      : formatVnd(previewRefundAmount)}
                </strong>{' '}
                qua chuyển khoản thủ công.
                {refundPreviewError && (
                  <div className="mt-1 text-xs text-amber-700">{refundPreviewError}</div>
                )}
              </div>
              <label className="block text-sm font-semibold text-slate-700">
                Lý do hủy
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  placeholder="Nhập lý do hủy đặt sân"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  Ngân hàng
                  <input
                    value={refundBankName}
                    onChange={(event) => setRefundBankName(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    placeholder="VD: Vietcombank"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Số tài khoản
                  <input
                    value={refundBankAccountNumber}
                    onChange={(event) =>
                      setRefundBankAccountNumber(event.target.value.replace(/\D/g, ''))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    placeholder="Nhập số tài khoản"
                  />
                </label>
              </div>
              <label className="block text-sm font-semibold text-slate-700">
                Tên chủ tài khoản
                <input
                  value={refundBankAccountName}
                  onChange={(event) => setRefundBankAccountName(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase outline-none focus:border-emerald-500"
                  placeholder="NGUYEN VAN A"
                />
              </label>
            </>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Booking chưa được xác nhận thanh toán nên sẽ hủy ngay và không phát sinh hoàn tiền.
            </div>
          )}
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
            onClick={() =>
              onConfirm({
                guestPhone,
                reason: reason.trim() || undefined,
                refundBankName: refundBankName.trim() || undefined,
                refundBankAccountNumber: refundBankAccountNumber.trim() || undefined,
                refundBankAccountName: refundBankAccountName.trim() || undefined,
              })
            }
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

export function canCustomerCancelBooking(booking: BookingResponse) {
  return canCancelFromCustomerView(booking)
}
