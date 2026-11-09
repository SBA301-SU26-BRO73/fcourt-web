import type { FormEvent } from 'react'

import type { Court } from '@/types/court'
import { DAY_OF_WEEK_LABELS } from '@/types/time-slot-template'
import { TEMPLATE_SLOT_MINUTES, type TimeSlotFormErrors, type TimeSlotFormMode, type TimeSlotFormValues } from './time-slot-form.utils'

type TimeSlotFormProps = {
  values: TimeSlotFormValues
  errors: TimeSlotFormErrors
  courts: Court[]
  isEdit: boolean
  isSubmitting: boolean
  onChange: (field: keyof TimeSlotFormValues, value: string | string[]) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  /** Rendered under the fields (the range preview). */
  children?: React.ReactNode
}

const MODES: Array<{ value: TimeSlotFormMode; title: string; hint: string }> = [
  { value: 'range', title: 'Theo khoảng giờ', hint: `Sinh các slot ${TEMPLATE_SLOT_MINUTES} phút và thay thế lịch mẫu của các ngày đã chọn.` },
  { value: 'single', title: 'Một khung giờ', hint: `Thêm đúng một slot ${TEMPLATE_SLOT_MINUTES} phút cho mỗi ngày đã chọn.` },
]

export function TimeSlotForm({ values, errors, courts, isEdit, isSubmitting, onChange, onSubmit, children }: TimeSlotFormProps) {
  const range = !isEdit && values.mode === 'range'
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
        <p className="mt-1 text-sm text-slate-500">Mỗi khung giờ mẫu dài {TEMPLATE_SLOT_MINUTES} phút. Ngày dùng giá trị 0 đến 6, từ Chủ nhật đến Thứ bảy.</p>

        {!isEdit && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {MODES.map((mode) => (
              <label key={mode.value} className={`cursor-pointer rounded-xl border px-4 py-3 ${values.mode === mode.value ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                <span className="flex items-center gap-2 text-sm font-bold">
                  <input type="radio" name="mode" checked={values.mode === mode.value} onChange={() => onChange('mode', mode.value)} className="size-4 accent-emerald-600" />
                  {mode.title}
                </span>
                <span className="mt-1 block text-xs text-slate-500">{mode.hint}</span>
              </label>
            ))}
          </div>
        )}

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

          {isEdit ? (
            <Field label="Ngày trong tuần" error={errors.dayOfWeeks}>
              <select value={values.dayOfWeeks[0] ?? ''} onChange={(event) => onChange('dayOfWeeks', [event.target.value])} className={fieldClass(errors.dayOfWeeks)}>
                {Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
          ) : (
            <Field label="Ngày trong tuần" error={errors.dayOfWeeks}>
              <div className={`${fieldClass(errors.dayOfWeeks)} grid grid-cols-2 gap-2`}>
                {Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => {
                  const checked = values.dayOfWeeks.includes(value)
                  return <label key={value} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium">
                    <input type="checkbox" checked={checked} onChange={() => onChange('dayOfWeeks', checked ? values.dayOfWeeks.filter((day) => day !== value) : [...values.dayOfWeeks, value])} className="size-4 accent-emerald-600" />
                    {label}
                  </label>
                })}
              </div>
            </Field>
          )}

          <Field label="Giờ bắt đầu" error={errors.startTime}>
            <input type="time" step={TEMPLATE_SLOT_MINUTES * 60} value={values.startTime} onChange={(event) => onChange('startTime', event.target.value)} className={fieldClass(errors.startTime)} />
          </Field>

          <Field label="Giờ kết thúc" error={errors.endTime}>
            <input type="time" step={TEMPLATE_SLOT_MINUTES * 60} value={values.endTime} onChange={(event) => onChange('endTime', event.target.value)} className={fieldClass(errors.endTime)} />
          </Field>

          <Field label={range ? 'Giá mỗi slot (tùy chọn)' : 'Giá'} required={!range} error={errors.price}>
            <input type="number" min="0.01" step="0.01" value={values.price} placeholder={range ? 'Để trống = giá mặc định của court' : '75000'} onChange={(event) => onChange('price', event.target.value)} className={fieldClass(errors.price)} />
            <span className="block text-xs text-slate-500">Giá của một slot {TEMPLATE_SLOT_MINUTES} phút.</span>
          </Field>
        </div>
      </section>

      {children}

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#10B981] px-5 py-3 text-sm font-bold text-white hover:bg-[#059669] disabled:opacity-60">
          {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật khung giờ' : range ? 'Áp dụng khung giờ' : 'Tạo khung giờ'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, error, required = true, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-semibold text-slate-700">{label} {required && <span className="text-red-600">*</span>}</span>{children}{error && <span className="block text-sm text-red-600">{error}</span>}</label>
}
