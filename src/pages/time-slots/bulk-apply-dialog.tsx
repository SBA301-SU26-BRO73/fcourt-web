import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { bulkApplyTimeSlotTemplate, previewBulkTimeSlotTemplate } from '@/services/time-slot-template/time-slot-template.api'
import type { Court } from '@/types/court'
import { DAY_OF_WEEK_LABELS, MAX_BULK_COURTS, type BulkPreviewResponse } from '@/types/time-slot-template'
import { formatMoney } from './schedule-format'
import { ErrorBanner } from './schedule-ui'
import { emptyTimeSlotFormValues, toApplyPayload, validateTimeSlotForm, type TimeSlotFormValues } from './time-slot-form.utils'

const fieldClass = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'

/** One template (hours, days, price) applied to many courts at once: preview first, all or nothing. */
export function BulkApplyDialog({ courts, onClose, onApplied }: { courts: Court[]; onClose: () => void; onApplied: (message: string) => void }) {
  const queryClient = useQueryClient()
  const [courtIds, setCourtIds] = useState<number[]>([])
  const [values, setValues] = useState<TimeSlotFormValues>({ ...emptyTimeSlotFormValues, dayOfWeeks: ['0', '1', '2', '3', '4', '5', '6'] })
  const [preview, setPreview] = useState<BulkPreviewResponse | null>(null)
  const [formError, setFormError] = useState('')

  const request = () => ({ courtIds, template: toApplyPayload(values) })
  const previewMutation = useMutation({ mutationFn: () => previewBulkTimeSlotTemplate(request()), onSuccess: setPreview })
  const applyMutation = useMutation({
    mutationFn: () => bulkApplyTimeSlotTemplate(request()),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['time-slots'] })
      onApplied(`Đã áp dụng ${result.totalSlots} khung giờ cho ${result.courts.length} sân.`)
    },
  })

  function change(patch: Partial<TimeSlotFormValues>) {
    setValues((current) => ({ ...current, ...patch }))
    setPreview(null)
    setFormError('')
  }
  function toggleCourt(id: number) {
    setCourtIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    setPreview(null)
    setFormError('')
  }
  function handlePreview() {
    if (courtIds.length === 0 || courtIds.length > MAX_BULK_COURTS) {
      setFormError(`Chọn từ 1 đến ${MAX_BULK_COURTS} sân.`)
      return
    }
    const errors = validateTimeSlotForm({ ...values, courtId: String(courtIds[0]) })
    const first = Object.values(errors)[0]
    if (first) {
      setFormError(first)
      return
    }
    previewMutation.mutate()
  }

  const error = applyMutation.error ?? previewMutation.error
  const busy = previewMutation.isPending || applyMutation.isPending
  const canApply = preview !== null && !preview.hasConflicts && !busy

  return <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 px-4 py-6"><div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
    <h2 className="text-xl font-black">Áp dụng khung giờ cho nhiều sân</h2>
    <p className="mt-2 text-sm text-slate-600">Lịch mẫu hiện có của các ngày đã chọn trên từng sân sẽ bị thay thế. Nếu một sân không áp dụng được, không sân nào bị thay đổi.</p>
    {error && <ErrorBanner error={error} />}
    {formError && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</div>}

    <div className="mt-5 grid gap-5 md:grid-cols-2">
      <div>
        <p className="text-sm font-bold text-slate-700">Sân ({courtIds.length}/{MAX_BULK_COURTS})</p>
        <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
          {courts.map((court) => <label key={court.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"><input type="checkbox" checked={courtIds.includes(court.id)} onChange={() => toggleCourt(court.id)} className="size-4 accent-emerald-600" />{court.name} - {court.branchName}</label>)}
          {courts.length === 0 && <p className="px-2 py-3 text-sm text-slate-500">Chưa có sân nào.</p>}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-700">Ngày trong tuần</p>
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 p-2">
          {Object.entries(DAY_OF_WEEK_LABELS).map(([day, label]) => {
            const checked = values.dayOfWeeks.includes(day)
            return <label key={day} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm"><input type="checkbox" checked={checked} onChange={() => change({ dayOfWeeks: checked ? values.dayOfWeeks.filter((item) => item !== day) : [...values.dayOfWeeks, day] })} className="size-4 accent-emerald-600" />{label}</label>
          })}
        </div>
      </div>
      <label className="space-y-1.5 text-sm font-bold text-slate-700"><span className="block">Giờ bắt đầu</span><input type="time" step={1800} value={values.startTime} onChange={(event) => change({ startTime: event.target.value })} className={fieldClass} /></label>
      <label className="space-y-1.5 text-sm font-bold text-slate-700"><span className="block">Giờ kết thúc</span><input type="time" step={1800} value={values.endTime} onChange={(event) => change({ endTime: event.target.value })} className={fieldClass} /></label>
      <label className="space-y-1.5 text-sm font-bold text-slate-700 md:col-span-2"><span className="block">Giá mỗi slot 30 phút (tùy chọn)</span><input type="number" min="0.01" step="0.01" value={values.price} placeholder="Để trống = giá mặc định của từng sân" onChange={(event) => change({ price: event.target.value })} className={fieldClass} /></label>
    </div>

    {preview && <div className="mt-5 rounded-xl border border-slate-200 p-4">
      <p className="text-sm font-bold">{preview.totalSlots} khung giờ sẽ được tạo{preview.hasConflicts && <span className="ml-2 text-red-600">Có sân không áp dụng được</span>}</p>
      <ul className="mt-3 divide-y divide-slate-100 text-sm">
        {preview.courts.map((court) => <li key={court.courtId} className="flex flex-wrap items-center justify-between gap-2 py-2"><span className="font-semibold">{court.courtName}</span>{court.conflict ? <span className="text-red-600">{court.conflict}</span> : <span className="text-slate-600">{court.totalSlots} khung giờ{court.slots[0] && ` (${formatMoney(court.slots[0].price)}/slot)`}</span>}</li>)}
      </ul>
    </div>}

    <div className="mt-6 flex flex-wrap justify-end gap-3">
      <button onClick={onClose} disabled={busy} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Hủy</button>
      <button onClick={handlePreview} disabled={busy} className="rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-[#059669] hover:bg-emerald-50 disabled:opacity-50">{previewMutation.isPending ? 'Đang kiểm tra...' : 'Xem trước'}</button>
      <button onClick={() => applyMutation.mutate()} disabled={!canApply} className="rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{applyMutation.isPending ? 'Đang áp dụng...' : 'Xác nhận áp dụng'}</button>
    </div>
  </div></div>
}
