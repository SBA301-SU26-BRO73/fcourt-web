import type { BookingStatus, StaffScheduleItem } from '@/types/staff'

export const SLOT_MINUTES = 30
export const ROW_HEIGHT = 56 // px per 30-min slot (matches design)
export const DEFAULT_OPEN = '06:00:00'
export const DEFAULT_CLOSE = '22:00:00'

/** "14:30:00" | "14:30" -> minutes since midnight. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

/** minutes since midnight -> "2:30 PM". */
export function formatTime12h(minutes: number): string {
  const h24 = Math.floor(minutes / 60)
  const m = minutes % 60
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

/** "14:30:00" -> "2:30 PM". */
export function formatClock(time: string): string {
  return formatTime12h(timeToMinutes(time))
}

/** Minutes since midnight for the local "now". */
export function nowMinutes(date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes()
}

/**
 * Build the row window for the grid. Snaps open down and close up to the slot
 * boundary, falling back to defaults when branch hours are missing.
 */
export function buildTimeWindow(
  openTime: string | null | undefined,
  closeTime: string | null | undefined,
): { openMin: number; closeMin: number; rows: number } {
  const openMin = timeToMinutes(openTime ?? DEFAULT_OPEN)
  const closeMin = timeToMinutes(closeTime ?? DEFAULT_CLOSE)
  const safeClose = closeMin > openMin ? closeMin : openMin + SLOT_MINUTES
  const rows = Math.ceil((safeClose - openMin) / SLOT_MINUTES)
  return { openMin, closeMin: safeClose, rows }
}

/** Visual treatment per booking status. */
export const STATUS_STYLES: Record<
  BookingStatus,
  { block: string; label: string; cta?: string }
> = {
  CONFIRMED: {
    block: 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100',
    label: 'Confirmed',
    cta: 'CHECK IN →',
  },
  CHECKED_IN: {
    block: 'bg-green-50 border-green-200 text-green-900 hover:bg-green-100',
    label: 'Playing',
    cta: 'CHECK OUT →',
  },
  COMPLETED: {
    block: 'bg-slate-100 border-slate-200 text-slate-500',
    label: 'Done',
  },
  AWAITING_CONFIRMATION: {
    block: 'bg-amber-50 border-amber-200 text-amber-900',
    label: 'Awaiting',
  },
  PENDING_PAYMENT: {
    block: 'bg-amber-50 border-amber-200 text-amber-900',
    label: 'Pending',
  },
  CANCELLED: {
    block: 'bg-red-50 border-red-200 text-red-700 line-through',
    label: 'Cancelled',
  },
}

/** Friendly customer label: registered name/email, guest phone, or fallback. */
export function customerLabel(item: StaffScheduleItem): string {
  return item.customerName ?? item.guestPhone ?? 'Guest'
}

/** Geometry for a booking block inside its court column. */
export function blockGeometry(item: StaffScheduleItem, openMin: number) {
  const startMin = timeToMinutes(item.startTime)
  const top = ((startMin - openMin) / SLOT_MINUTES) * ROW_HEIGHT
  const span = Math.max(1, item.slotCount)
  const height = span * ROW_HEIGHT
  return { top, height, span }
}
