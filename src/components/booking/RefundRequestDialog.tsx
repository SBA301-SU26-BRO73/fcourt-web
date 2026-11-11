import { useState } from 'react'
import { Landmark, Loader2 } from 'lucide-react'

import { VIETNAM_BANKS, formatVnd, validateRefundForm } from '@/pages/booking/my-booking.utils'
import type { MyBooking, RefundRequestPayload } from '@/types/my-booking'

interface RefundRequestDialogProps {
  booking: MyBooking | null
  amount: number
  submitting?: boolean
  onClose: () => void
  onSubmit: (payload: RefundRequestPayload) => void
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500'

/** Refund request form (POST /refunds/request). The amount comes from the server and is not editable. */
export function RefundRequestDialog({ booking, amount, submitting = false, onClose, onSubmit }: RefundRequestDialogProps) {
  if (!booking) return null
  return <RefundDialogBody key={booking.id} booking={booking} amount={amount} submitting={submitting} onClose={onClose} onSubmit={onSubmit} />
}

function RefundDialogBody({
  booking,
  amount,
  submitting,
  onClose,
  onSubmit,
}: RefundRequestDialogProps & { booking: MyBooking }) {
  const [bankBin, setBankBin] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [reason, setReason] = useState(booking.cancellationReason ?? '')
  const [touched, setTouched] = useState(false)

  const errors = validateRefundForm({ bankBin, accountNumber, accountName, reason })
  const hasErrors = Object.keys(errors).length > 0

  function handleSubmit() {
    setTouched(true)
    if (hasErrors) return
    const bank = VIETNAM_BANKS.find((item) => item.bin === bankBin)
    onSubmit({
      bookingId: booking.id,
      bankName: bank?.name ?? bankBin,
      bankBin,
      bankAccountNumber: accountNumber.trim(),
      bankAccountName: accountName.trim().toUpperCase(),
      reason: reason.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div role="dialog" aria-label="Yêu cầu hoàn tiền" className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <Landmark size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Yêu cầu hoàn tiền</h2>
            <p className="mt-1 text-sm text-slate-500">
              Mã đơn {booking.bookingCode} - hoàn <strong>{formatVnd(amount)}</strong>
            </p>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          <label className="block text-sm font-semibold text-slate-700">
            Ngân hàng
            <select value={bankBin} onChange={(event) => setBankBin(event.target.value)} className={inputClass}>
              <option value="">Chọn ngân hàng</option>
              {VIETNAM_BANKS.map((bank) => (
                <option key={bank.bin} value={bank.bin}>
                  {bank.name}
                </option>
              ))}
            </select>
            {touched && errors.bankBin && <span className="mt-1 block text-xs font-normal text-red-600">{errors.bankBin}</span>}
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Số tài khoản
            <input
              value={accountNumber}
              inputMode="numeric"
              maxLength={20}
              onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ''))}
              className={inputClass}
              placeholder="Nhập số tài khoản"
            />
            {touched && errors.accountNumber && (
              <span className="mt-1 block text-xs font-normal text-red-600">{errors.accountNumber}</span>
            )}
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Tên chủ tài khoản
            <input
              value={accountName}
              maxLength={150}
              onChange={(event) => setAccountName(event.target.value)}
              className={`${inputClass} uppercase`}
              placeholder="NGUYEN VAN A"
            />
            {touched && errors.accountName && (
              <span className="mt-1 block text-xs font-normal text-red-600">{errors.accountName}</span>
            )}
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Lý do
            <textarea
              value={reason}
              maxLength={500}
              rows={3}
              onChange={(event) => setReason(event.target.value)}
              className={inputClass}
              placeholder="Lý do yêu cầu hoàn tiền"
            />
            {touched && errors.reason && <span className="mt-1 block text-xs font-normal text-red-600">{errors.reason}</span>}
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
            disabled={submitting}
            onClick={handleSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  )
}
