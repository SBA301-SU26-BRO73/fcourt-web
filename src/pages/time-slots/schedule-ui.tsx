import { Trash2 } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { getTimeSlotErrorMessage } from './time-slot-error.utils'

/** Small building blocks shared by the three court schedule screens (templates, pricing, locks). */

const TABS = [
  { to: '/admin/time-slots', label: 'Khung giờ mẫu' },
  { to: '/admin/pricing-rules', label: 'Giá theo khung giờ' },
  { to: '/admin/court-locks', label: 'Khóa slot và bảo trì' },
] as const

export function ScheduleTabs() {
  return <nav className="mb-6 flex flex-wrap gap-2" aria-label="Giá và lịch sân">
    {TABS.map((tab) => <NavLink key={tab.to} to={tab.to} end className={({ isActive }) => `rounded-xl border px-4 py-2.5 text-sm font-bold ${isActive ? 'border-[#10B981] bg-[#10B981] text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'}`}>{tab.label}</NavLink>)}
  </nav>
}

export function Select({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return <label className="space-y-1.5 text-sm font-bold text-slate-700"><span className="block">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
}

export function State({ title, description, action }: { title: string; description?: string; action?: () => void }) {
  return <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"><h2 className="text-lg font-bold">{title}</h2>{description && <p className="mt-2 text-sm text-slate-500">{description}</p>}{action && <button onClick={action} className="mt-4 rounded-xl bg-[#10B981] px-4 py-2 text-sm font-bold text-white">Thử lại</button>}</div>
}

export function ErrorBanner({ error }: { error: unknown }) {
  return <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{getTimeSlotErrorMessage(error)}</div>
}

export function SuccessBanner({ message }: { message: string }) {
  return <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{message}</div>
}

export function ConfirmDialog({ title, description, confirmLabel, isBusy, onCancel, onConfirm }: { title: string; description: string; confirmLabel: string; isBusy: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="grid size-12 place-items-center rounded-full bg-red-100 text-red-600"><Trash2 /></div><h2 className="mt-4 text-xl font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p><div className="mt-6 flex justify-end gap-3"><button onClick={onCancel} disabled={isBusy} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Hủy</button><button onClick={onConfirm} disabled={isBusy} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{confirmLabel}</button></div></div></div>
}
