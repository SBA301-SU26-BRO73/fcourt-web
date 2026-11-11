import type { CourtSlot } from '@/types/public-branch'
import type { ScheduleSession, StaffCourt, TodaySchedule } from '@/types/counter'
import type { BookingStatus, StaffScheduleItem } from '@/types/staff'
import { DEFAULT_CLOSE, DEFAULT_OPEN, SLOT_MINUTES, timeToMinutes } from '@/pages/staff/schedule-utils'

const BUSINESS_ZONE = 'Asia/Ho_Chi_Minh'
const ENDING_SOON_MINUTES = 10

/** Slot end `00:00` means midnight at the end of the day. */
function endMinutes(time: string): number {
  const minutes = timeToMinutes(time)
  return minutes === 0 ? 24 * 60 : minutes
}

function minutesToClock(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${h}:${m}:00`
}

/** yyyy-MM-dd of `date` in the business time zone (Asia/Ho_Chi_Minh), the day the backend calls today. */
export function todayIso(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/** Minutes since midnight in the business time zone. */
export function businessNowMinutes(date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: BUSINESS_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return hour * 60 + minute
}

/**
 * The schedule answers one entry per slot session; the screens draw one block per booking, so the
 * sessions of a booking on a court are merged (earliest start, latest end).
 */
export function scheduleToItems(schedule: TodaySchedule | undefined): StaffScheduleItem[] {
  if (!schedule) return []
  const items: StaffScheduleItem[] = []
  for (const court of schedule.courts) {
    const byBooking = new Map<number, ScheduleSession[]>()
    for (const slot of court.slots) {
      byBooking.set(slot.bookingId, [...(byBooking.get(slot.bookingId) ?? []), slot])
    }
    for (const [bookingId, slots] of byBooking) {
      const start = Math.min(...slots.map((s) => timeToMinutes(s.slotStart)))
      const end = Math.max(...slots.map((s) => endMinutes(s.slotEnd)))
      const first = slots[0]
      items.push({
        bookingId,
        courtId: court.courtId,
        courtName: court.courtName,
        customerName: first.customerName,
        guestPhone: first.guestPhone,
        status: first.status as BookingStatus,
        date: first.date,
        startTime: minutesToClock(start),
        endTime: minutesToClock(end),
        slotCount: slots.length,
      })
    }
  }
  return items.sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))
}

/**
 * The branch hours are not readable by staff, so the row window is the default opening hours
 * widened to fit every booking of the day.
 */
export function scheduleWindow(items: StaffScheduleItem[]): { openTime: string; closeTime: string } {
  let open = timeToMinutes(DEFAULT_OPEN)
  let close = timeToMinutes(DEFAULT_CLOSE)
  for (const item of items) {
    const start = timeToMinutes(item.startTime)
    const end = timeToMinutes(item.endTime)
    if (Number.isFinite(start)) open = Math.min(open, Math.floor(start / 60) * 60)
    if (Number.isFinite(end)) close = Math.max(close, Math.ceil(end / 60) * 60)
  }
  return { openTime: minutesToClock(open), closeTime: minutesToClock(Math.min(close, 24 * 60)) }
}

export type CourtBoardStatus = 'FREE' | 'PLAYING' | 'ENDING_SOON' | 'BOOKED_NOT_CHECKED_IN'

export interface CourtBoardItem {
  courtId: number
  courtName: string
  status: CourtBoardStatus
  minutesRemaining: number | null
  bookingId: number | null
  customerName: string | null
  slotStart: string | null
  slotEnd: string | null
}

/**
 * There is no court board endpoint, so each court's state is read from today's schedule:
 * a checked-in booking covering now is PLAYING (ENDING_SOON in its last 10 minutes), a confirmed
 * booking covering now or starting within 30 minutes is BOOKED_NOT_CHECKED_IN, otherwise FREE.
 */
export function deriveCourtBoard(
  courts: Array<Pick<StaffCourt, 'id' | 'name'>>,
  items: StaffScheduleItem[],
  nowMin: number,
): CourtBoardItem[] {
  return courts.map((court) => {
    const own = items.filter((i) => i.courtId === court.id)
    const covering = (i: StaffScheduleItem) =>
      nowMin >= timeToMinutes(i.startTime) && nowMin < timeToMinutes(i.endTime)
    const playing = own.find((i) => i.status === 'CHECKED_IN' && covering(i))
    const booked = own.find(
      (i) =>
        i.status === 'CONFIRMED' &&
        (covering(i) ||
          (timeToMinutes(i.startTime) > nowMin && timeToMinutes(i.startTime) - nowMin <= SLOT_MINUTES)),
    )
    const current = playing ?? booked
    if (!current) {
      return {
        courtId: court.id,
        courtName: court.name,
        status: 'FREE',
        minutesRemaining: null,
        bookingId: null,
        customerName: null,
        slotStart: null,
        slotEnd: null,
      }
    }
    const remaining = timeToMinutes(current.endTime) - nowMin
    return {
      courtId: court.id,
      courtName: court.name,
      status: playing ? (remaining <= ENDING_SOON_MINUTES ? 'ENDING_SOON' : 'PLAYING') : 'BOOKED_NOT_CHECKED_IN',
      minutesRemaining: playing ? remaining : null,
      bookingId: current.bookingId,
      customerName: current.customerName ?? current.guestPhone,
      slotStart: current.startTime,
      slotEnd: current.endTime,
    }
  })
}

/**
 * A walk-in takes consecutive slots: a click next to the current selection extends it, a click on
 * a selected slot removes it, any other free slot starts a new selection. Booked slots are ignored.
 */
export function toggleWalkInSlot(slotId: number, selected: number[], slots: CourtSlot[]): number[] {
  const slot = slots.find((s) => s.slotId === slotId)
  if (!slot || slot.status !== 'AVAILABLE') return selected
  if (selected.includes(slotId)) return selected.filter((id) => id !== slotId)
  if (selected.length === 0) return [slotId]
  const index = slots.findIndex((s) => s.slotId === slotId)
  const indexes = selected.map((id) => slots.findIndex((s) => s.slotId === id)).sort((a, b) => a - b)
  if (index === indexes[0] - 1 || index === indexes[indexes.length - 1] + 1) return [...selected, slotId]
  return [slotId]
}

/** Selected slots in time order, with their total price and the covered time range. */
export function summarizeWalkIn(selected: number[], slots: CourtSlot[]) {
  const chosen = slots
    .filter((s) => selected.includes(s.slotId))
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
  return {
    chosen,
    total: chosen.reduce((sum, s) => sum + s.price, 0),
    startTime: chosen[0]?.startTime ?? null,
    endTime: chosen[chosen.length - 1]?.endTime ?? null,
  }
}

/** Monday of the ISO week containing `iso` (yyyy-MM-dd), as yyyy-MM-dd. */
export function weekStartOf(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  const offset = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - offset)
  return d.toISOString().slice(0, 10)
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
