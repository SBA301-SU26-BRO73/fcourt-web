import { useState, type FormEvent } from 'react'

import type { CourtTypeData } from '@/types/admin'
import type { BranchStatus } from '@/types/branch'
import type { CourtStatus } from '@/types/court'
import type { CourtFormErrors, CourtFormValues } from './court-form.utils'

type CourtFormProps = {
  values: CourtFormValues
  errors: CourtFormErrors
  branches: Array<{ id: number; name: string; status: BranchStatus }>
  courtTypes: CourtTypeData[]
  isCourtTypesLoading: boolean
  isEdit: boolean
  isSubmitting: boolean
  submitLabel: string
  onChange: (field: keyof CourtFormValues, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const statuses: Array<{ value: CourtStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'INACTIVE', label: 'Ngừng hoạt động' },
  { value: 'MAINTENANCE', label: 'Bảo trì' },
]

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return <span id={id} className="block text-sm text-red-600">{message}</span>
}

export function CourtForm({
  values,
  errors,
  branches,
  courtTypes,
  isCourtTypesLoading,
  isEdit,
  isSubmitting,
  submitLabel,
  onChange,
  onSubmit,
}: CourtFormProps) {
  const [failedImageUrl, setFailedImageUrl] = useState('')
  const previewImageUrl = values.imageUrl.trim()
  const imageLoadFailed = failedImageUrl === previewImageUrl

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
        : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
    }`

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950">Thông tin sân</h2>
          <p className="mt-1 text-sm text-slate-500">Các trường có dấu * là bắt buộc.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Branch *</span>
            <select
              name="branchId"
              value={values.branchId}
              disabled={isEdit}
              aria-invalid={Boolean(errors.branchId)}
              aria-describedby={errors.branchId ? 'branchId-error' : undefined}
              onChange={(event) => onChange('branchId', event.target.value)}
              className={`${inputClass(Boolean(errors.branchId))} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500`}
            >
              <option value="">Chọn branch đang hoạt động</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
            <ErrorText id="branchId-error" message={errors.branchId} />
            {isEdit && <span className="block text-xs text-slate-500">Backend không hỗ trợ chuyển sân sang branch khác.</span>}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Tên sân *</span>
            <input
              name="name"
              value={values.name}
              maxLength={150}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
              onChange={(event) => onChange('name', event.target.value)}
              className={inputClass(Boolean(errors.name))}
            />
            <ErrorText id="name-error" message={errors.name} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Loại sân *</span>
            <select
              name="courtTypeId"
              value={values.courtTypeId}
              disabled={isCourtTypesLoading}
              aria-invalid={Boolean(errors.courtTypeId)}
              aria-describedby={errors.courtTypeId ? 'courtTypeId-error' : undefined}
              onChange={(event) => onChange('courtTypeId', event.target.value)}
              className={`${inputClass(Boolean(errors.courtTypeId))} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500`}
            >
              <option value="">{isCourtTypesLoading ? 'Đang tải loại sân...' : 'Chọn loại sân'}</option>
              {courtTypes.map((courtType) => (
                <option key={courtType.id} value={courtType.id}>
                  {courtType.name}{courtType.nameEn ? ` (${courtType.nameEn})` : ''}{courtType.active ? '' : ' - đang ẩn'}
                </option>
              ))}
            </select>
            <ErrorText id="courtTypeId-error" message={errors.courtTypeId} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Trạng thái *</span>
            <select
              name="status"
              value={values.status}
              onChange={(event) => onChange('status', event.target.value)}
              className={inputClass(Boolean(errors.status))}
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Mô tả</span>
            <textarea
              name="description"
              rows={4}
              value={values.description}
              onChange={(event) => onChange('description', event.target.value)}
              className={inputClass(Boolean(errors.description))}
            />
          </label>

          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Image URL</span>
            <input
              name="imageUrl"
              type="url"
              value={values.imageUrl}
              placeholder="https://example.com/court.jpg"
              aria-invalid={Boolean(errors.imageUrl)}
              aria-describedby={errors.imageUrl ? 'imageUrl-error' : undefined}
              onChange={(event) => onChange('imageUrl', event.target.value)}
              className={inputClass(Boolean(errors.imageUrl))}
            />
            <ErrorText id="imageUrl-error" message={errors.imageUrl} />
          </label>
        </div>

        {values.imageUrl && !errors.imageUrl && (
          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Xem trước ảnh</p>
            {imageLoadFailed ? (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700">
                Không thể tải ảnh từ URL này. Hãy kiểm tra URL có trỏ trực tiếp đến file ảnh công khai và không yêu cầu đăng nhập.
              </div>
            ) : (
              <img
                src={previewImageUrl}
                alt="Court preview"
                className="h-48 w-full rounded-lg border border-slate-200 bg-white object-cover sm:w-80"
                onLoad={() => setFailedImageUrl('')}
                onError={() => setFailedImageUrl(previewImageUrl)}
              />
            )}
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[#10B981] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#059669] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Đang lưu...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
