import type { FormEvent } from 'react'

import type { Court } from '@/types/court'
import { DAY_OF_WEEK_LABELS } from '@/types/time-slot-template'
import type { TimeSlotFormErrors, TimeSlotFormValues } from './time-slot-form.utils'

type TimeSlotFormProps = {
  values: TimeSlotFormValues
  errors: TimeSlotFormErrors
  courts: Court[]
  isEdit: boolean
  isSubmitting: boolean
  onChange: (field: keyof TimeSlotFormValues, value: string | boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function TimeSlotForm({
  values,
  errors,
  courts,
  isEdit,
  isSubmitting,
  onChange,
  onSubmit,
}: TimeSlotFormProps) {
  const fieldClass = (error?: string) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 ${
      error
        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
        : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
    }`

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold">Thông tin khung giờ mẫu</h2>
        <p className="mt-1 text-sm text-slate-500">Payload ngày dùng giá trị 0 đến 6, từ Chủ nhật đến Thứ bảy.</p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Court" error={errors.courtId}>
            <select
              value={values.courtId}
              disabled={isEdit}
              onChange={(event) => onChange('courtId', event.target.value)}
              className={`${fieldClass(errors.courtId)} disabled:cursor-not-allowed disabled:bg-slate-100`}
            >
              <option value="">Chọn court</option>
              {courts.map((court) => <option key={court.id} value={court.id}>{court.name} - {court.branchName}</option>)}
            </select>
          </Field>

          <Field label="Ngày trong tuần" error={errors.dayOfWeek}>
            <select value={values.dayOfWeek} onChange={(event) => onChange('dayOfWeek', event.target.value)} className={fieldClass(errors.dayOfWeek)}>
              {Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Field>

          <Field label="Giờ bắt đầu" error={errors.startTime}>
            <input type="time" value={values.startTime} onChange={(event) => onChange('startTime', event.target.value)} className={fieldClass(errors.startTime)} />
          </Field>

          <Field label="Giờ kết thúc" error={errors.endTime}>
            <input type="time" value={values.endTime} onChange={(event) => onChange('endTime', event.target.value)} className={fieldClass(errors.endTime)} />
          </Field>

          <Field label="Giá" error={errors.price}>
            <input type="number" min="0.01" step="0.01" value={values.price} placeholder="150000" onChange={(event) => onChange('price', event.target.value)} className={fieldClass(errors.price)} />
          </Field>

          <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input type="checkbox" checked={values.active} onChange={(event) => onChange('active', event.target.checked)} className="size-4 accent-emerald-600" />
            <span><span className="block text-sm font-bold">Đang hoạt động</span><span className="text-xs text-slate-500">Inactive vẫn tồn tại và có thể bật lại.</span></span>
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#10B981] px-5 py-3 text-sm font-bold text-white hover:bg-[#059669] disabled:opacity-60">
          {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật khung giờ' : 'Tạo khung giờ'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-semibold text-slate-700">{label} <span className="text-red-600">*</span></span>{children}{error && <span className="block text-sm text-red-600">{error}</span>}</label>
}
