import { AlertCircle, Eye, EyeOff, Lock } from 'lucide-react'
import { type InputHTMLAttributes, type ReactNode, useState } from 'react'

import { validators } from '@/utils/validators'

/* ── Logo ────────────────────────────────────────────────────── */
import { ShieldCheck } from 'lucide-react'

export function Logo({ sub = 'Đặt sân thể thao' }: { sub?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white flex-shrink-0">
        <ShieldCheck size={18} />
      </span>
      <span>
        <div className="font-bold text-[15px] text-slate-900 leading-none tracking-tight">
          FCourt
        </div>
        <div className="text-[11px] text-slate-500">{sub}</div>
      </span>
    </div>
  )
}

/* ── Field ───────────────────────────────────────────────────── */
interface FieldProps {
  label?: string
  opt?: string
  error?: string
  hint?: string
  children: ReactNode
}

export function Field({ label, opt, error, hint, children }: FieldProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label}
          {opt && <span className="ml-1.5 text-xs font-normal text-slate-400">{opt}</span>}
        </label>
      )}
      <div className="relative">{children}</div>
      {error && (
        <div className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
          <AlertCircle size={13} />
          {error}
        </div>
      )}
      {hint && !error && <div className="mt-1.5 text-xs text-slate-400">{hint}</div>}
    </div>
  )
}

/* ── TextInput ───────────────────────────────────────────────── */
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasIcon?: boolean
  error?: string
}

export function TextInput({ hasIcon, error, className = '', ...props }: TextInputProps) {
  return (
    <input
      className={[
        'w-full rounded-xl border px-3 py-2.5 text-sm bg-slate-50 outline-none transition',
        'focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20',
        error
          ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
          : 'border-slate-200',
        hasIcon ? 'pl-9' : '',
        props.disabled ? 'opacity-60 cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}

/* ── PasswordInput ───────────────────────────────────────────── */
interface PasswordInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string
  autoComplete?: string
  name?: string
}

export function PasswordInput({
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  name,
}: PasswordInputProps) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <Lock size={15} />
      </span>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        autoComplete={autoComplete}
        className={[
          'w-full rounded-xl border pl-9 pr-10 py-2.5 text-sm bg-slate-50 outline-none transition',
          'focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20',
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
            : 'border-slate-200',
        ].join(' ')}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

/* ── Button ──────────────────────────────────────────────────── */
type ButtonVariant = 'primary' | 'ghost' | 'subtle'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  block?: boolean
  lg?: boolean
  loading?: boolean
  children?: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-green-600 hover:bg-green-700 text-white border border-transparent shadow-sm hover:shadow',
  ghost: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
  subtle: 'text-green-700 hover:bg-green-50 border border-transparent',
}

export function Button({
  variant = 'primary',
  block,
  lg,
  loading,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={loading || props.disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        lg ? 'px-5 py-3 text-sm' : 'px-4 py-2 text-sm',
        block ? 'w-full' : '',
        variantClass[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  )
}

/* ── Check ───────────────────────────────────────────────────── */
interface CheckProps {
  checked: boolean
  onChange: (v: boolean) => void
  children: ReactNode
  alignTop?: boolean
}

export function Check({ checked, onChange, children, alignTop }: CheckProps) {
  return (
    <label
      className={`flex gap-2.5 cursor-pointer text-sm text-slate-700 ${alignTop ? 'items-start' : 'items-center'}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={[
          'flex-shrink-0 w-4 h-4 rounded border transition',
          alignTop ? 'mt-0.5' : '',
          checked ? 'bg-green-600 border-green-600' : 'bg-white border-slate-300',
        ].join(' ')}
      >
        {checked && (
          <svg viewBox="0 0 16 16" fill="none" className="w-full h-full text-white">
            <path
              d="M3.5 8l3 3 5.5-5.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span>{children}</span>
    </label>
  )
}

/* ── PwMeter ─────────────────────────────────────────────────── */
const METER_COLORS = [
  '',
  'bg-red-500',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-green-500',
] as const
const METER_LABELS = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'] as const

export function PwMeter({ value }: { value: string }) {
  if (!value) return null
  const s = validators.passwordStrength(value)
  return (
    <div className="mb-4 -mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i <= s ? METER_COLORS[s] : 'bg-slate-200'}`}
          />
        ))}
      </div>
      {s > 0 && (
        <div className="text-xs text-slate-400">
          Độ mạnh mật khẩu:{' '}
          <b className="text-slate-700">{METER_LABELS[s]}</b>
        </div>
      )}
    </div>
  )
}
