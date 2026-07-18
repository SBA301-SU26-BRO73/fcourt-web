import { Calendar, CheckCircle, ScanLine } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatClock } from '@/pages/staff/schedule-utils'
import type { StaffCheckinResponse } from '@/types/staff'

interface CheckinSuccessProps {
  result: StaffCheckinResponse
  onScanNext: () => void
  onBackToSchedule: () => void
}

function formatCheckedInAt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  )
}

export function CheckinSuccess({
  result,
  onScanNext,
  onBackToSchedule,
}: CheckinSuccessProps) {
  const customer = result.customerName ?? result.guestPhone ?? 'Guest'

  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white">
          <CheckCircle size={36} />
        </div>
      </div>

      <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
        Check-in successful
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {customer} is good to go on {result.courtName}.
      </p>

      <div className="mt-6 w-full max-w-md divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white px-5">
        <SummaryRow label="Customer" value={customer} />
        <SummaryRow label="Court" value={result.courtName} />
        <SummaryRow
          label="Time slot"
          value={`${formatClock(result.startTime)} – ${formatClock(result.endTime)}`}
        />
        <SummaryRow
          label="Checked in at"
          value={formatCheckedInAt(result.checkedInAt)}
        />
      </div>

      <div className="mt-7 flex gap-3">
        <Button variant="ghost" onClick={onBackToSchedule} icon={<Calendar size={16} />}>
          Back to today&apos;s schedule
        </Button>
        <Button variant="primary" onClick={onScanNext} icon={<ScanLine size={16} />}>
          Scan next customer
        </Button>
      </div>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-slate-400">
        Screen auto-returns in 30s · #{result.bookingId}
      </p>
    </div>
  )
}
