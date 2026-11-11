import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useWeekSchedule } from '@/hooks/staff/use-week-schedule'
import { addDays, todayIso, weekStartOf } from '@/pages/staff/counter-utils'
import { STATUS_STYLES, formatClock } from '@/pages/staff/schedule-utils'
import type { WeekScheduleEntry } from '@/types/counter'
import type { BookingStatus } from '@/types/staff'

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function chipClass(entry: WeekScheduleEntry): string {
  const style = STATUS_STYLES[entry.status as BookingStatus]
  const base = style?.block ?? 'bg-slate-100 border-slate-200 text-slate-500'
  return entry.flags.lateCheckIn ? `${base} ring-1 ring-red-300` : base
}

function dayLabel(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
}

/** Monday-to-Sunday schedule of the branch, one row per court (GET /api/staff/schedule). */
export function WeekSchedule() {
  const [weekStart, setWeekStart] = useState(() => weekStartOf(todayIso()))
  const query = useWeekSchedule(weekStart)
  const today = todayIso()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Tuần trước"
          icon={<ChevronLeft size={14} />}
          onClick={() => setWeekStart((w) => addDays(w, -7))}
        />
        <span className="text-sm font-medium text-slate-700">
          {dayLabel(weekStart)} – {dayLabel(addDays(weekStart, 6))}
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Tuần sau"
          icon={<ChevronRight size={14} />}
          onClick={() => setWeekStart((w) => addDays(w, 7))}
        />
        <Button variant="neutral" onClick={() => setWeekStart(weekStartOf(todayIso()))}>
          Tuần này
        </Button>
      </div>

      {query.isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          Loading schedule…
        </div>
      ) : query.isError || !query.data ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700">
          Could not load the week schedule.
        </div>
      ) : query.data.courts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          No courts found for this branch.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[900px] table-fixed border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="w-32 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Court
                </th>
                {DAY_LABELS.map((label, i) => {
                  const date = addDays(weekStart, i)
                  return (
                    <th
                      key={label}
                      className={`border-l border-slate-100 px-2 py-2 text-left font-semibold ${
                        date === today ? 'text-green-700' : 'text-slate-600'
                      }`}
                    >
                      {label} · {dayLabel(date)}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {query.data.courts.map((court) => (
                <tr key={court.courtId} className="border-b border-slate-100 align-top last:border-b-0">
                  <td className="px-3 py-2 text-sm font-semibold text-slate-800">{court.courtName}</td>
                  {DAY_LABELS.map((label, i) => {
                    const date = addDays(weekStart, i)
                    const slots = court.days.find((d) => d.date === date)?.slots ?? []
                    return (
                      <td key={label} className="border-l border-slate-100 p-1.5">
                        <div className="flex flex-col gap-1">
                          {slots.map((entry) => (
                            <div
                              key={`${entry.bookingId}-${entry.slotStart}`}
                              className={`truncate rounded border px-1.5 py-1 ${chipClass(entry)}`}
                              title={`${entry.customerName ?? entry.guestPhone ?? 'Guest'} · #${entry.bookingId}`}
                            >
                              <span className="font-mono">{formatClock(entry.slotStart)}</span>{' '}
                              {entry.customerName ?? entry.guestPhone ?? 'Guest'}
                            </div>
                          ))}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
