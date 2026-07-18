import type { FormEvent } from 'react'

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
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
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
  onSubmit,
}: BranchFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-950">Branch information</h2>
          <p className="mt-1 text-sm text-slate-500">
            Fields marked with * are required.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Branch name"
            name="name"
            value={values.name}
            error={errors.name}
            maxLength={150}
            required
            onChange={onChange}
          />
          <div className="md:col-span-2">
            <Field
              label="Address"
              name="address"
              value={values.address}
              error={errors.address}
              maxLength={255}
              required
              onChange={onChange}
            />
          </div>
          <Field
            label="Ward"
            name="ward"
            value={values.ward}
            error={errors.ward}
            maxLength={100}
            onChange={onChange}
          />
          <Field
            label="City"
            name="city"
            value={values.city}
            error={errors.city}
            maxLength={100}
            required
            onChange={onChange}
          />
          <Field
            label="Phone"
            name="phone"
            value={values.phone}
            error={errors.phone}
            maxLength={20}
            onChange={onChange}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Open time"
              name="openTime"
              value={values.openTime}
              error={errors.openTime}
              type="time"
              required
              onChange={onChange}
            />
            <Field
              label="Close time"
              name="closeTime"
              value={values.closeTime}
              error={errors.closeTime}
              type="time"
              required
              onChange={onChange}
            />
          </div>
        </div>

      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-950">Bank information</h2>
        <p className="mt-1 text-sm text-slate-500">All fields are optional.</p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field
            label="Account number"
            name="bankAccountNumber"
            value={values.bankAccountNumber}
            error={errors.bankAccountNumber}
            maxLength={50}
            onChange={onChange}
          />
          <Field
            label="Account name"
            name="bankAccountName"
            value={values.bankAccountName}
            error={errors.bankAccountName}
            maxLength={150}
            onChange={onChange}
          />
          <Field
            label="Bank name"
            name="bankName"
            value={values.bankName}
            error={errors.bankName}
            maxLength={100}
            onChange={onChange}
          />
          <Field
            label="QR image URL"
            name="bankQrImageUrl"
            value={values.bankQrImageUrl}
            error={errors.bankQrImageUrl}
            type="url"
            placeholder="https://example.com/qr.png"
            onChange={onChange}
          />
        </div>
        {values.bankQrImageUrl && !errors.bankQrImageUrl && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">QR preview</p>
            <img
              src={values.bankQrImageUrl}
              alt="Bank QR preview"
              className="h-36 w-36 rounded-lg border border-slate-200 bg-white object-contain"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[#10B981] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#059669] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
