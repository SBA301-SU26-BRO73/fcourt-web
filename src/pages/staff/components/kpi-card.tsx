import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  icon: LucideIcon
  iconClass: string
  value: number | string
  label: string
}

export function KpiCard({ icon: Icon, iconClass, value, label }: KpiCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}
      >
        <Icon size={18} />
      </div>
      <div className="leading-tight">
        <div className="text-xl font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  )
}
