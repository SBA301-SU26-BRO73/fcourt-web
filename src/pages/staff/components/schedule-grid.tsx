import { useMemo } from 'react'

import type { Court } from '@/types/court'
import type { StaffScheduleItem } from '@/types/staff'
import { BookingBlock } from '@/pages/staff/components/booking-block'
import {
  ROW_HEIGHT,
  SLOT_MINUTES,
  formatTime12h,
  nowMinutes,
} from '@/pages/staff/schedule-utils'

interface ScheduleGridProps {
  courts: Court[]
  schedule: StaffScheduleItem[]
  openMin: number
  rows: number
  onBookingClick?: (item: StaffScheduleItem) => void
}

const TIME_COL = 78

export function ScheduleGrid({
  courts,
  schedule,
  openMin,
  rows,
  onBookingClick,
}: ScheduleGridProps) {
  const bookingsByCourt = useMemo(() => {
    const map = new Map<number, StaffScheduleItem[]>()
    for (const item of schedule) {
      const list = map.get(item.courtId) ?? []
      list.push(item)
      map.set(item.courtId, list)
    }
    return map
  }, [schedule])

  const bodyHeight = rows * ROW_HEIGHT
  const now = nowMinutes()
  const closeMin = openMin + rows * SLOT_MINUTES
  const showNow = now >= openMin && now <= closeMin
  const nowTop = ((now - openMin) / SLOT_MINUTES) * ROW_HEIGHT

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Header row: time gutter + court names */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <div
          className="shrink-0 px-2 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
          style={{ width: TIME_COL }}
        >
          Time
        </div>
        {courts.map((court) => (
          <div
            key={court.id}
            className="flex-1 border-l border-slate-100 px-3 py-2"
          >
            <div className="truncate text-sm font-semibold text-slate-800">
              {court.name}
            </div>
            <div className="truncate text-[11px] text-slate-400">
              {court.courtTypeName}
            </div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="relative flex">
        {/* Time gutter */}
        <div
          className="relative shrink-0"
          style={{ width: TIME_COL, height: bodyHeight }}
        >
          {Array.from({ length: rows }).map((_, i) => {
            const min = openMin + i * SLOT_MINUTES
            if (min % 60 !== 0) return null
            return (
              <div
                key={i}
                className="absolute left-0 right-1 text-right font-mono text-[11px] text-slate-400"
                style={{ top: i * ROW_HEIGHT - 6 }}
              >
                {formatTime12h(min)}
              </div>
            )
          })}
        </div>

        {/* Court columns */}
        <div className="relative flex flex-1">
          {courts.map((court) => (
            <div
              key={court.id}
              className="relative flex-1 border-l border-slate-100"
              style={{ height: bodyHeight }}
            >
              {Array.from({ length: rows }).map((_, i) => (
                <div
                  key={i}
                  className="border-t border-dashed border-slate-100"
                  style={{ height: ROW_HEIGHT }}
                />
              ))}
              {bookingsByCourt.get(court.id)?.map((item) => (
                <BookingBlock
                  key={item.bookingId}
                  item={item}
                  openMin={openMin}
                  onClick={onBookingClick}
                />
              ))}
            </div>
          ))}

          {showNow && (
            <div
              className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
              style={{ top: nowTop }}
            >
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <div className="h-px flex-1 bg-rose-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
