import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Field } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCreateStaff, useUpdateStaff } from '@/hooks/use-admin-staff'
import { useIdempotencyKey } from '@/hooks/use-idempotency-key'
import { getApiErrorMessage, isApiError } from '@/common/utils/api-error'
import type { StaffResponse, StaffShift } from '@/types/staff'
import {
  DAY_LABELS,
  PASSWORD_MIN,
  emptyStaffFormValues,
  staffToFormValues,
  toCreateStaffRequest,
  toUpdateStaffRequest,
  validateStaffForm,
  type StaffFormErrors,
  type StaffFormValues,
} from '../staff-form.utils'

interface StaffFormModalProps {
  mode: 'create' | 'edit'
  initial?: StaffResponse
  branchId: number
  branchName?: string
  onClose: () => void
}

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 bg-white text-slate-800 ${
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-green-500 focus:ring-green-100'
  }`

export function StaffFormModal({ mode, initial, branchId, branchName, onClose }: StaffFormModalProps) {
  const isEdit = mode === 'edit'
  const [values, setValues] = useState<StaffFormValues>(() =>
    initial ? staffToFormValues(initial) : emptyStaffFormValues,
  )
  const [errors, setErrors] = useState<StaffFormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const keyFor = useIdempotencyKey()

  const createMutation = useCreateStaff()
  const updateMutation = useUpdateStaff()
  const isPending = createMutation.isPending || updateMutation.isPending

  function change<K extends keyof StaffFormValues>(field: K, value: StaffFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setServerError(null)
  }

  function changeShift(index: number, patch: Partial<StaffShift>) {
    change(
      'shifts',
      values.shifts.map((shift, i) => (i === index ? { ...shift, ...patch } : shift)),
    )
  }

  function handleError(error: unknown) {
    if (isApiError(error)) {
      const fields = error.fieldErrors
      setErrors((current) => ({
        ...current,
        ...(fields.email ? { email: fields.email } : {}),
        ...(fields.password ? { password: fields.password } : {}),
        ...(fields.fullName ? { fullName: fields.fullName } : {}),
        ...(fields.phone ? { phone: fields.phone } : {}),
      }))
    }
    setServerError(getApiErrorMessage(error, 'Có lỗi xảy ra, vui lòng thử lại.'))
  }

  function handleSubmit() {
    setServerError(null)
    const nextErrors = validateStaffForm(values, isEdit)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (isEdit && initial) {
      const payload = toUpdateStaffRequest(values)
      updateMutation.mutate(
        { id: initial.id, payload, key: keyFor({ id: initial.id, payload }) },
        { onSuccess: onClose, onError: handleError },
      )
    } else {
      const payload = toCreateStaffRequest(values, branchId)
      createMutation.mutate({ payload, key: keyFor(payload) }, { onSuccess: onClose, onError: handleError })
    }
  }

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa tài khoản' : 'Thêm nhân viên'}
      subtitle={
        isEdit
          ? `Cập nhật thông tin của ${initial?.email}`
          : `Tạo tài khoản nhân viên mới${branchName ? ` cho ${branchName}` : ' cho chi nhánh'}.`
      }
      onClose={onClose}
      width={580}
      footer={
        <>
          <Button onClick={onClose} disabled={isPending}>
            Huỷ
          </Button>
          <Button variant="primary" disabled={isPending} onClick={handleSubmit}>
            {isPending ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {serverError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Field
          label="Email (dùng để đăng nhập)"
          required
          error={errors.email}
          hint="Nhân viên sẽ dùng email này để đăng nhập. Không thể đổi sau khi tạo."
        >
          <input
            type="email"
            value={values.email}
            onChange={(e) => change('email', e.target.value)}
            disabled={isEdit}
            placeholder="name@bro73.app"
            className={`${inputClass(Boolean(errors.email))} ${isEdit ? 'cursor-not-allowed bg-slate-50 text-slate-400' : ''}`}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Họ và tên" required error={errors.fullName}>
            <input
              value={values.fullName}
              maxLength={150}
              onChange={(e) => change('fullName', e.target.value)}
              placeholder="Nguyễn Văn A"
              className={inputClass(Boolean(errors.fullName))}
            />
          </Field>
          <Field label="Số điện thoại" required error={errors.phone}>
            <input
              type="tel"
              value={values.phone}
              onChange={(e) => change('phone', e.target.value)}
              placeholder="0901234567"
              className={inputClass(Boolean(errors.phone))}
            />
          </Field>
        </div>

        {!isEdit && (
          <Field
            label="Mật khẩu tạm thời"
            required
            error={errors.password}
            hint={`Tối thiểu ${PASSWORD_MIN} ký tự.`}
          >
            <input
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={(e) => change('password', e.target.value)}
              placeholder={`Tối thiểu ${PASSWORD_MIN} ký tự`}
              className={inputClass(Boolean(errors.password))}
            />
          </Field>
        )}

        <Field label="Ca làm việc trong tuần" error={errors.shifts} hint="Có thể để trống và bổ sung sau.">
          <div className="space-y-2">
            {values.shifts.map((shift, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  aria-label="Ngày"
                  value={shift.dayOfWeek}
                  onChange={(e) => changeShift(index, { dayOfWeek: Number(e.target.value) })}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
                >
                  {Object.entries(DAY_LABELS).map(([day, label]) => (
                    <option key={day} value={day}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  aria-label="Bắt đầu"
                  value={shift.startTime}
                  onChange={(e) => changeShift(index, { startTime: e.target.value })}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="time"
                  aria-label="Kết thúc"
                  value={shift.endTime}
                  onChange={(e) => changeShift(index, { endTime: e.target.value })}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800"
                />
                <button
                  type="button"
                  title="Xoá ca"
                  onClick={() =>
                    change(
                      'shifts',
                      values.shifts.filter((_, i) => i !== index),
                    )
                  }
                  className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <Button
              icon={<Plus size={14} />}
              onClick={() =>
                change('shifts', [...values.shifts, { dayOfWeek: 1, startTime: '08:00', endTime: '12:00' }])
              }
            >
              Thêm ca
            </Button>
          </div>
        </Field>

        {isEdit && initial && (
          <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <span className="text-xs text-slate-500">Trạng thái tài khoản:</span>
            <Badge tone={initial.active ? 'green' : 'gray'}>{initial.active ? 'Active' : 'Inactive'}</Badge>
          </div>
        )}
      </div>
    </Modal>
  )
}
