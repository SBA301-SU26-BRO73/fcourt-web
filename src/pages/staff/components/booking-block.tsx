import type { StaffScheduleItem } from '@/types/staff'
import {
  STATUS_STYLES,
  blockGeometry,
  customerLabel,
  formatClock,
} from '@/pages/staff/schedule-utils'

interface BookingBlockProps {
  item: StaffScheduleItem
  openMin: number
  onClick?: (item: StaffScheduleItem) => void
}

export function BookingBlock({ item, openMin, onClick }: BookingBlockProps) {
  const style = STATUS_STYLES[item.status]
  const { top, height, span } = blockGeometry(item, openMin)
  const clickable =
    (item.status === 'CONFIRMED' || item.status === 'CHECKED_IN') && onClick != null

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={clickable ? () => onClick?.(item) : undefined}
      style={{ top, height }}
      className={`absolute inset-x-1 flex flex-col gap-0.5 overflow-hidden rounded-lg border px-2 py-1.5 text-left ${style.block} ${
        clickable ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <span className="truncate text-[12.5px] font-semibold leading-tight">
        {customerLabel(item)}
      </span>
      <span className="font-mono text-[10.5px] opacity-75">
        {formatClock(item.startTime)} – {formatClock(item.endTime)}
      </span>
      {span >= 2 && (
        <span className="mt-auto flex items-center justify-between font-mono text-[10.5px]">
          <span className="opacity-70">#{item.bookingId}</span>
          {style.cta && <span className="font-semibold">{style.cta}</span>}
        </span>
      )}
    </button>
  )
}
