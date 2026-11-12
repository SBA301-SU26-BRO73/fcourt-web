import { useState, type FormEvent } from 'react'
import { isApiError } from '@/common/utils/api-error'
import { useGuestRefund } from '@/hooks/use-guest-refund'
import { useCountdown } from '@/hooks/use-countdown'
import { formatVnd, REFUND_STATUS_LABELS } from '@/pages/booking/my-booking.utils'
import type { GuestRefundIdentity, GuestRefundPayload } from '@/services/refund/guest-refund.api'
import type { Refund } from '@/types/my-booking'

export function guestRefundErrorMessage(error: unknown) {
  if (isApiError(error)) {
    if (error.status === 404) return 'Không tìm thấy đơn đặt sân. Kiểm tra lại mã đơn và số điện thoại.'
    if (error.status === 409) return 'Không thể cập nhật thông tin hoàn tiền. Đơn không đủ điều kiện hoặc yêu cầu đã được xử lý. Vui lòng kiểm tra lại trạng thái.'
    if (error.status === 429) return error.retryAfterSeconds
      ? `Bạn thao tác quá nhiều lần. Vui lòng thử lại sau ${error.retryAfterSeconds} giây.`
      : 'Bạn thao tác quá nhiều lần. Vui lòng thử lại sau ít phút.'
    if (error.status === 400) return 'Thông tin ngân hàng chưa hợp lệ. Vui lòng kiểm tra lại.'
  }
  return 'Không thể xử lý hoàn tiền lúc này. Vui lòng thử lại.'
}

export function validateGuestRefund(payload: Pick<GuestRefundPayload, 'bankName' | 'accountNumber' | 'accountHolder' | 'bankBin'>) {
  if (!payload.bankName.trim() || payload.bankName.trim().length > 100) return 'Tên ngân hàng phải có từ 1 đến 100 ký tự.'
  if (!/^\d{6,20}$/.test(payload.accountNumber.trim())) return 'Số tài khoản phải gồm 6–20 chữ số.'
  if (payload.accountHolder.trim().length < 2 || payload.accountHolder.trim().length > 150) return 'Tên chủ tài khoản phải có từ 2 đến 150 ký tự.'
  if (payload.bankBin?.trim() && !/^970\d{3}$/.test(payload.bankBin.trim())) return 'Mã BIN phải gồm 6 chữ số, bắt đầu bằng 970.'
  return null
}

export function GuestRefundSection({ identity, amount, onRateLimited }: { identity: GuestRefundIdentity; amount: number; onRateLimited?: (deadline: number) => void }) {
  const { query, mutation, retryAt } = useGuestRefund(identity, onRateLimited)
  const error = mutation.error ?? query.error
  const { isExpired } = useCountdown(retryAt)
  const coolingDown = retryAt !== null && !isExpired

  const state = query.data
  const request = state?.request
  const canSubmit = state?.eligible && (!request || request.bankInfoMissing || request.status === 'PENDING')
  const proof = request?.transferProofUrl
  const proofUrl = proof && /^https?:\/\//i.test(proof) ? proof : null

  return (
    <section aria-label="Hoàn tiền" className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-sm font-bold text-slate-900">Hoàn tiền: {formatVnd(state?.amount ?? amount)}</h2>
      {query.isPending && <p className="text-sm text-slate-500">Đang tải thông tin hoàn tiền…</p>}
      {request && (
        <div className="text-sm text-slate-700">
          <p>Trạng thái: {REFUND_STATUS_LABELS[request.status]}</p>
          {request.bankInfoMissing && <p className="mt-1 text-amber-700">Chưa có thông tin ngân hàng</p>}
          {request.adminNote && <p className="mt-1">Ghi chú từ chủ sân: {request.adminNote}</p>}
          {proofUrl && <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-green-700 underline">Xem chứng từ chuyển khoản</a>}
        </div>
      )}
      {state && !request && <p className="text-sm text-slate-500">Chưa có yêu cầu hoàn tiền.{state.eligible ? ' Vui lòng cung cấp thông tin ngân hàng để nhận tiền hoàn.' : ''}</p>}
      {error && <p role="alert" className="text-sm text-red-700">{guestRefundErrorMessage(error)}</p>}
      {(state || error) && <button type="button" disabled={coolingDown || query.isFetching || mutation.isPending} onClick={() => { mutation.reset(); void query.refetch() }} className="text-sm font-semibold text-green-700 underline disabled:opacity-60">Kiểm tra lại trạng thái</button>}
      {canSubmit && (
        <GuestRefundForm
          key={`${request?.id ?? 'new'}:${request?.updatedAt ?? ''}`}
          request={request}
          disabled={coolingDown || mutation.isPending || query.isFetching || (isApiError(error) && (error.status === 409 || error.status === 404))}
          onSubmit={(fields) => mutation.mutate({ ...identity, ...fields })}
        />
      )}
      {mutation.isSuccess && <p role="status" className="text-sm text-green-700">Đã lưu thông tin nhận tiền hoàn.</p>}
    </section>
  )
}

function GuestRefundForm({ request, disabled, onSubmit }: {
  request?: Refund | null
  disabled: boolean
  onSubmit: (fields: Omit<GuestRefundPayload, keyof GuestRefundIdentity>) => void
}) {
  const [bankName, setBankName] = useState(request?.bankName ?? '')
  const [accountNumber, setAccountNumber] = useState(request?.bankAccountNumber ?? '')
  const [accountHolder, setAccountHolder] = useState(request?.bankAccountName ?? '')
  const [bankBin, setBankBin] = useState(request?.bankBin ?? '')
  const [validation, setValidation] = useState<string | null>(null)
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500'

  function submit(event: FormEvent) {
    event.preventDefault()
    if (disabled) return
    const fields = { bankName, accountNumber, accountHolder, bankBin }
    const message = validateGuestRefund(fields)
    setValidation(message)
    if (!message) onSubmit(fields)
  }

  return (
    <form aria-label="Thông tin nhận tiền hoàn" onSubmit={submit} className="space-y-3">
      <fieldset disabled={disabled} className="space-y-3 disabled:opacity-60">
        <label className="block text-sm font-medium text-slate-700">Tên ngân hàng<input required maxLength={100} value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass} /></label>
        <label className="block text-sm font-medium text-slate-700">Số tài khoản<input required inputMode="numeric" pattern="[0-9]{6,20}" minLength={6} maxLength={20} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className={inputClass} /></label>
        <label className="block text-sm font-medium text-slate-700">Tên chủ tài khoản<input required minLength={2} maxLength={150} value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className={inputClass} /></label>
        <label className="block text-sm font-medium text-slate-700">Mã BIN ngân hàng (không bắt buộc)<input inputMode="numeric" pattern="970[0-9]{3}" maxLength={6} value={bankBin} onChange={(e) => setBankBin(e.target.value)} className={inputClass} /></label>
        {validation && <p role="alert" className="text-sm text-red-700">{validation}</p>}
        <button type="submit" disabled={disabled} className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">Lưu thông tin hoàn tiền</button>
      </fieldset>
    </form>
  )
}
