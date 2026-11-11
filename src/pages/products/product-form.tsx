import type { FormEvent } from 'react'

import type { BranchStatus } from '@/types/branch'
import type { ProductFormErrors, ProductFormValues } from './product-form.utils'

type ProductFormProps = {
  values: ProductFormValues
  errors: ProductFormErrors
  branches: Array<{ id: number; name: string; status: BranchStatus }>
  isEdit: boolean
  isSubmitting: boolean
  submitLabel: string
  onChange: (field: keyof ProductFormValues, value: string | boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return <span id={id} className="block text-sm text-red-600">{message}</span>
}

export function ProductForm({
  values,
  errors,
  branches,
  isEdit,
  isSubmitting,
  submitLabel,
  onChange,
  onSubmit,
}: ProductFormProps) {
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
          <h2 className="text-lg font-bold text-slate-950">Thông tin sản phẩm</h2>
          <p className="mt-1 text-sm text-slate-500">Các trường có dấu * là bắt buộc.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Chi nhánh *</span>
            <select
              name="branchId"
              value={values.branchId}
              disabled={isEdit}
              aria-invalid={Boolean(errors.branchId)}
              aria-describedby={errors.branchId ? 'branchId-error' : undefined}
              onChange={(event) => onChange('branchId', event.target.value)}
              className={`${inputClass(Boolean(errors.branchId))} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500`}
            >
              <option value="">Chọn chi nhánh đang hoạt động</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
            <ErrorText id="branchId-error" message={errors.branchId} />
            {isEdit && <span className="block text-xs text-slate-500">Không thể chuyển sản phẩm sang chi nhánh khác.</span>}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Tên sản phẩm *</span>
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
            <span className="text-sm font-semibold text-slate-700">Nhóm sản phẩm *</span>
            <input
              name="category"
              value={values.category}
              maxLength={60}
              placeholder="Nước uống, phụ kiện..."
              aria-invalid={Boolean(errors.category)}
              aria-describedby={errors.category ? 'category-error' : undefined}
              onChange={(event) => onChange('category', event.target.value)}
              className={inputClass(Boolean(errors.category))}
            />
            <ErrorText id="category-error" message={errors.category} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Đơn vị</span>
            <input
              name="unit"
              value={values.unit}
              maxLength={30}
              placeholder="chai, ly, giờ..."
              aria-invalid={Boolean(errors.unit)}
              aria-describedby={errors.unit ? 'unit-error' : undefined}
              onChange={(event) => onChange('unit', event.target.value)}
              className={inputClass(Boolean(errors.unit))}
            />
            <ErrorText id="unit-error" message={errors.unit} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Giá bán (VNĐ) *</span>
            <input
              name="price"
              type="number"
              min="0"
              step="1000"
              value={values.price}
              aria-invalid={Boolean(errors.price)}
              aria-describedby={errors.price ? 'price-error' : undefined}
              onChange={(event) => onChange('price', event.target.value)}
              className={inputClass(Boolean(errors.price))}
            />
            <ErrorText id="price-error" message={errors.price} />
          </label>

          {!isEdit && (
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Tồn kho ban đầu *</span>
              <input
                name="stockQuantity"
                type="number"
                min="0"
                step="1"
                value={values.stockQuantity}
                aria-invalid={Boolean(errors.stockQuantity)}
                aria-describedby={errors.stockQuantity ? 'stockQuantity-error' : undefined}
                onChange={(event) => onChange('stockQuantity', event.target.value)}
                className={inputClass(Boolean(errors.stockQuantity))}
              />
              <ErrorText id="stockQuantity-error" message={errors.stockQuantity} />
            </label>
          )}

          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Ảnh sản phẩm (đường dẫn https)</span>
            <input
              name="imageUrl"
              type="url"
              value={values.imageUrl}
              placeholder="https://..."
              aria-invalid={Boolean(errors.imageUrl)}
              aria-describedby={errors.imageUrl ? 'imageUrl-error' : undefined}
              onChange={(event) => onChange('imageUrl', event.target.value)}
              className={inputClass(Boolean(errors.imageUrl))}
            />
            <ErrorText id="imageUrl-error" message={errors.imageUrl} />
            {values.imageUrl.trim().startsWith('https://') && !errors.imageUrl && (
              <img
                src={values.imageUrl.trim()}
                alt="Xem trước ảnh sản phẩm"
                className="mt-2 h-28 w-28 rounded-xl border border-slate-200 object-cover"
              />
            )}
          </label>

          {isEdit && (
            <label className="flex items-center gap-2.5 md:col-span-2">
              <input
                type="checkbox"
                checked={values.active}
                onChange={(event) => onChange('active', event.target.checked)}
                className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-semibold text-slate-700">Đang bán (hiển thị cho Staff tại quầy)</span>
            </label>
          )}
        </div>
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
