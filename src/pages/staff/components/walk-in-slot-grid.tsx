import { formatClock } from '@/pages/staff/schedule-utils'
import type { TimeSlotTemplate } from '@/types/booking'

interface WalkInSlotGridProps {
  templates: TimeSlotTemplate[]
  bookedTimes: Set<string>
  selectedTimes: string[]
  onToggle: (startTime: string) => void
}

export function WalkInSlotGrid({
  templates,
  bookedTimes,
  selectedTimes,
  onToggle,
}: WalkInSlotGridProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {templates.map((tmpl) => {
          const isBooked = bookedTimes.has(tmpl.startTime)
          const isSelected = selectedTimes.includes(tmpl.startTime)
          return (
            <button
              key={tmpl.id}
              type="button"
              disabled={isBooked}
              onClick={() => onToggle(tmpl.startTime)}
              className={`rounded-lg border px-2 py-2.5 text-center font-mono text-xs font-medium transition-colors ${
                isBooked
                  ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through'
                  : isSelected
                    ? 'border-green-600 bg-green-600 text-white shadow-inner'
                    : 'cursor-pointer border-slate-200 bg-white text-slate-700 hover:border-green-200 hover:bg-green-50'
              }`}
            >
              {formatClock(tmpl.startTime)}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded border border-slate-200 bg-white" />
          Open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded border border-green-600 bg-green-600" />
          Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded border border-slate-100 bg-slate-50" />
          Booked
        </span>
      </div>
    </div>
  )
}
