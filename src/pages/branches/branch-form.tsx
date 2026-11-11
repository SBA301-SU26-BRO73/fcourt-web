import type { FormEvent, ReactNode } from 'react'

import type {
  BranchFormErrors,
  BranchFormValues,
} from './branch-form.utils'

type BranchFormProps = {
  values: BranchFormValues
  errors: BranchFormErrors
  isSubmitting: boolean
  submitLabel: string
  onChange: (field: keyof BranchFormValues, value: string) => void
  gallery: ReactNode
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  cities: string[]
  districts: string[]
  wards: string[]
}

function SelectField({
  label,
  name,
  value,
  options,
  error,
  required,
  disabled,
  onChange,
}: {
  label: string
  name: keyof BranchFormValues
  value: string
  options: string[]
  error?: string
  required?: boolean
  disabled?: boolean
  onChange: BranchFormProps['onChange']
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      <select
        name={name}
        value={value}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(name, event.target.value)}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 disabled:bg-slate-100 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
        }`}
      >
        <option value="">Chọn {label.toLowerCase()}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      {error && <span className="block text-sm text-red-600">{error}</span>}
    </label>
  )
}

type FieldProps = {
  label: string
  name: keyof BranchFormValues
  value: string
  error?: string
  required?: boolean
  type?: string
  maxLength?: number
  placeholder?: string
  onChange: BranchFormProps['onChange']
}

function Field({
  label,
  name,
  value,
  error,
  required,
  type = 'text',
  maxLength,
  placeholder,
  onChange,
}: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={(event) => onChange(name, event.target.value)}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
        }`}
      />
      {error && (
        <span id={`${name}-error`} className="block text-sm text-red-600">
          {error}
        </span>
      )}
    </label>
  )
}

export function BranchForm({
  values,
  errors,
  isSubmitting,
  submitLabel,
  onChange,
  gallery,
  onSubmit,
  cities,
  districts,
  wards,
}: BranchFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950">Thông tin chi nhánh</h2>
          <p className="mt-1 text-sm text-slate-500">
            Các trường có dấu * là bắt buộc.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Tên chi nhánh"
            name="name"
            value={values.name}
            error={errors.name}
            maxLength={150}
            required
            onChange={onChange}
          />
          <div className="md:col-span-2">
            <Field
              label="Địa chỉ"
              name="address"
              value={values.address}
              error={errors.address}
              maxLength={255}
              required
              onChange={onChange}
            />
          </div>
          <SelectField
            label="Tỉnh/Thành phố"
            name="city"
            value={values.city}
            error={errors.city}
            options={cities}
            required
            onChange={onChange}
          />
          <SelectField
            label="Quận/Huyện"
            name="district"
            value={values.district}
            error={errors.district}
            options={districts}
            disabled={!values.city}
            required
            onChange={onChange}
          />
          <SelectField
            label="Phường/Xã"
            name="ward"
            value={values.ward}
            error={errors.ward}
            options={wards}
            disabled={!values.district}
            required
            onChange={onChange}
          />
          <Field
            label="Số điện thoại"
            name="phone"
            value={values.phone}
            error={errors.phone}
            maxLength={20}
            onChange={onChange}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Giờ mở cửa"
              name="openTime"
              value={values.openTime}
              error={errors.openTime}
              type="time"
              required
              onChange={onChange}
            />
            <Field
              label="Giờ đóng cửa"
              name="closeTime"
              value={values.closeTime}
              error={errors.closeTime}
              type="time"
              required
              onChange={onChange}
            />
          </div>
          <SelectField
            label="Thời lượng mỗi khung giờ"
            name="slotDurationMinutes"
            value={values.slotDurationMinutes}
            error={errors.slotDurationMinutes}
            options={['30', '60']}
            required
            onChange={(field, value) => onChange(field, value.replace(' phút', ''))}
          />
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Trạng thái</span>
            <select
              name="status"
              value={values.status}
              onChange={(event) => onChange('status', event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Tạm đóng</option>
            </select>
          </label>
        </div>

      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Thông tin ngân hàng</h2>
        <p className="mt-1 text-sm text-slate-500">Dùng để tạo mã VietQR khi khách thanh toán. Tất cả các trường đều bắt buộc.</p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Tên ngân hàng" name="bankName" value={values.bankName} error={errors.bankName} maxLength={100} required onChange={onChange} />
          <Field label="Mã BIN ngân hàng" name="bankBin" value={values.bankBin} error={errors.bankBin} maxLength={6} placeholder="Ví dụ 970436" required onChange={onChange} />
          <Field label="Số tài khoản" name="bankAccountNumber" value={values.bankAccountNumber} error={errors.bankAccountNumber} maxLength={20} required onChange={onChange} />
          <Field label="Tên chủ tài khoản" name="bankAccountName" value={values.bankAccountName} error={errors.bankAccountName} maxLength={150} required onChange={onChange} />
        </div>
      </section>

      {gallery}

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
