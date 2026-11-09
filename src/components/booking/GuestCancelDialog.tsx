import { useState } from 'react'
import { AlertTriangle, Ban, Loader2 } from 'lucide-react'

interface GuestCancelDialogProps {
  open: boolean
  bookingCode: string
  courtName: string
  paid: boolean
  submitting?: boolean
  error?: string | null
  onClose: () => void
  onConfirm: (reason: string) => void
}

/** Confirm dialog for a guest cancellation; the reason is optional (max 500 characters). */
export function GuestCancelDialog({ open, bookingCode, courtName, paid, submitting = false, error, onClose, onConfirm }: GuestCancelDialogProps) {
  const [reason, setReason] = useState('')
  if (!open) return null
  const tooLong = reason.trim().length > 500

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
              Mã đơn {bookingCode} - {courtName}
            </p>
          </div>
        </div>
        <div className="space-y-4 px-5 py-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Bạn chắc chắn muốn hủy đơn này? Thao tác không thể hoàn tác.
            {paid && ' Đơn đã thanh toán sẽ được hoàn tiền theo chính sách của sân.'}
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Lý do hủy (không bắt buộc)
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500"
            />
          </label>
          {tooLong && <div className="text-xs text-red-600">Lý do tối đa 500 ký tự.</div>}
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            Giữ đơn
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={submitting || tooLong}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Ban size={15} />}
            Xác nhận hủy
          </button>
        </div>
      </div>
    </div>
  )
}
