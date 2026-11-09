import { formatClock } from '@/pages/staff/schedule-utils'
import type { CourtSlot } from '@/types/public-branch'

interface WalkInSlotGridProps {
  slots: CourtSlot[]
  selectedIds: number[]
  onToggle: (slotId: number) => void
}

/** Today's slots of a court; only AVAILABLE ones can be picked, the rest are dimmed. */
export function WalkInSlotGrid({ slots, selectedIds, onToggle }: WalkInSlotGridProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {slots.map((slot) => {
          const isBooked = slot.status !== 'AVAILABLE'
          const isSelected = selectedIds.includes(slot.slotId)
          return (
            <button
              key={slot.slotId}
              type="button"
              disabled={isBooked}
              onClick={() => onToggle(slot.slotId)}
              className={`rounded-lg border px-2 py-2.5 text-center font-mono text-xs font-medium transition-colors ${
                isBooked
                  ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through'
                  : isSelected
                    ? 'border-green-600 bg-green-600 text-white shadow-inner'
                    : 'cursor-pointer border-slate-200 bg-white text-slate-700 hover:border-green-200 hover:bg-green-50'
              }`}
            >
              {formatClock(slot.startTime)}
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
