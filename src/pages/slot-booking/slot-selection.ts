import type { SelectedSlot } from './components/booking-panel'

/** Backend limit of HoldRequest.slotIds. */
export const MAX_HELD_SLOTS = 48

export function toHHmm(time: string) {
  return time.slice(0, 5)
}

export function toMinutes(time: string) {
  const [hour = '0', minute = '0'] = time.split(':')
  return Number(hour) * 60 + Number(minute)
}

export function sameSlot(a: SelectedSlot, b: SelectedSlot) {
  return a.slotId === b.slotId && a.courtId === b.courtId && a.date === b.date
}

function byStart(slots: SelectedSlot[]) {
  return [...slots].sort((x, y) => toMinutes(x.startTime) - toMinutes(y.startTime))
}

/** The booking API only accepts slots of one court and one day that touch each other. */
export function isContiguous(slots: SelectedSlot[]) {
  const ordered = byStart(slots)
  return ordered.every(
    (slot, index) => index === 0 || toMinutes(ordered[index - 1].endTime) === toMinutes(slot.startTime),
  )
}

export interface ToggleResult {
  slots: SelectedSlot[]
  /** Short Vietnamese hint to show when the click replaced the previous selection. */
  notice?: string
}

/**
 * Click on a free cell. One selection = one court + one day + a contiguous run of slots:
 * a click elsewhere starts a new selection instead of building an invalid one.
 */
export function toggleSlot(current: SelectedSlot[], clicked: SelectedSlot): ToggleResult {
  const next: SelectedSlot = { ...clicked, startTime: toHHmm(clicked.startTime), endTime: toHHmm(clicked.endTime) }

  if (current.some((slot) => sameSlot(slot, next))) {
    // Removing from the middle would split the run: keep the part before the removed slot.
    const ordered = byStart(current)
    const index = ordered.findIndex((slot) => sameSlot(slot, next))
    const isEdge = index === 0 || index === ordered.length - 1
    return { slots: isEdge ? ordered.filter((slot) => !sameSlot(slot, next)) : ordered.slice(0, index) }
  }

  const first = current[0]
  if (first && (first.courtId !== next.courtId || first.date !== next.date)) {
    return { slots: [next], notice: 'Mỗi lần đặt chỉ gồm một sân trong một ngày. Đã chuyển sang lựa chọn mới.' }
  }
  if (current.length >= MAX_HELD_SLOTS) {
    return { slots: current, notice: `Tối đa ${MAX_HELD_SLOTS} khung giờ mỗi lần đặt.` }
  }
  const candidate = [...current, next]
  if (!isContiguous(candidate)) {
    return { slots: [next], notice: 'Các khung giờ phải liền nhau. Đã bắt đầu lựa chọn mới.' }
  }
  return { slots: byStart(candidate) }
}
