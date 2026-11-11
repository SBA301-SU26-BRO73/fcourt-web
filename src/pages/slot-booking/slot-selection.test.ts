import { describe, expect, it } from 'vitest'

import type { SelectedSlot } from './components/booking-panel'
import { isContiguous, MAX_HELD_SLOTS, toggleSlot } from './slot-selection'

function slot(slotId: number, start: string, end: string, courtId = 1, date = '2030-01-01'): SelectedSlot {
  return { slotId, courtId, courtName: `Sân ${courtId}`, startTime: start, endTime: end, price: 50000, date }
}
const s1 = slot(1, '06:00:00', '06:30:00')
const s2 = slot(2, '06:30', '07:00')
const s3 = slot(3, '07:00', '07:30')
const s5 = slot(5, '08:00', '08:30')

describe('toggleSlot', () => {
  it('normalises times to HH:mm and builds a contiguous run in time order', () => {
    const a = toggleSlot([], s2)
    expect(a.slots[0].startTime).toBe('06:30')
    const b = toggleSlot(a.slots, s1)
    expect(b.slots.map((x) => x.slotId)).toEqual([1, 2])
    expect(b.notice).toBeUndefined()
  })

  it('starts a new selection when the click is not adjacent', () => {
    const { slots, notice } = toggleSlot([slot(1, '06:00', '06:30')], s5)
    expect(slots.map((x) => x.slotId)).toEqual([5])
    expect(notice).toMatch(/liền nhau/)
  })

  it('starts a new selection on another court or another day', () => {
    expect(toggleSlot([s1], slot(7, '06:30', '07:00', 2)).slots.map((x) => x.slotId)).toEqual([7])
    expect(toggleSlot([s1], slot(8, '06:30', '07:00', 1, '2030-01-02')).notice).toMatch(/một sân/)
  })

  it('removes an edge slot, and truncates when a middle slot is removed', () => {
    const run = [slot(1, '06:00', '06:30'), s2, s3]
    expect(toggleSlot(run, run[2]).slots.map((x) => x.slotId)).toEqual([1, 2])
    expect(toggleSlot(run, run[0]).slots.map((x) => x.slotId)).toEqual([2, 3])
    expect(toggleSlot(run, run[1]).slots.map((x) => x.slotId)).toEqual([1])
  })

  it('caps the selection at the HoldRequest limit', () => {
    const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
    const run = Array.from({ length: MAX_HELD_SLOTS }, (_, i) => slot(i + 1, hhmm(i * 30), hhmm(i * 30 + 30)))
    const result = toggleSlot(run, slot(99, '24:00', '24:30'))
    expect(result.slots).toBe(run)
    expect(result.notice).toMatch(/Tối đa/)
  })
})

describe('isContiguous', () => {
  it('detects gaps', () => {
    expect(isContiguous([slot(1, '06:00', '06:30'), s2, s3])).toBe(true)
    expect(isContiguous([slot(1, '06:00', '06:30'), s3])).toBe(false)
  })
})
