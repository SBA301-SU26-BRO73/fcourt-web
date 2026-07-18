import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface FieldProps {
  label?: string
  required?: boolean
  hint?: string
  error?: string | null
  children: ReactNode
}

export function Field({ label, required, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}
