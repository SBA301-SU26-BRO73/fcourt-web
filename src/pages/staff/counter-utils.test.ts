import { describe, expect, it } from 'vitest'

import type { TodaySchedule } from '@/types/counter'
import type { CourtSlot } from '@/types/public-branch'
import type { StaffScheduleItem } from '@/types/staff'

import {
  addDays,
  deriveCourtBoard,
  scheduleToItems,
  scheduleWindow,
  summarizeWalkIn,
  todayIso,
  toggleWalkInSlot,
  weekStartOf,
} from './counter-utils'

function session(bookingId: number, slotStart: string, slotEnd: string, status = 'CONFIRMED') {
  return { bookingId, date: '2026-11-09', slotStart, slotEnd, status, customerName: 'An', guestPhone: null }
}

function item(overrides: Partial<StaffScheduleItem>): StaffScheduleItem {
  return {
    bookingId: 1,
    courtId: 1,
    courtName: 'Court 1',
    customerName: 'An',
    guestPhone: null,
    status: 'CONFIRMED',
    date: '2026-11-09',
    startTime: '10:00:00',
    endTime: '11:00:00',
    slotCount: 2,
    ...overrides,
  }
}

describe('scheduleToItems', () => {
  it('merges the slot sessions of one booking into one block', () => {
    const schedule: TodaySchedule = {
      branchId: 1,
      courts: [
        {
          courtId: 4,
          courtName: 'Court 4',
          slots: [session(1, '08:30:00', '09:00:00'), session(1, '08:00:00', '08:30:00'), session(2, '10:00:00', '10:30:00')],
        },
      ],
    }
    const items = scheduleToItems(schedule)
    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({ bookingId: 1, startTime: '08:00:00', endTime: '09:00:00', slotCount: 2, courtId: 4 })
    expect(items[1]).toMatchObject({ bookingId: 2, slotCount: 1 })
  })

  it('reads a slot ending at 00:00 as midnight', () => {
    const items = scheduleToItems({
      branchId: 1,
      courts: [{ courtId: 1, courtName: 'C', slots: [session(1, '23:30:00', '00:00:00')] }],
    })
    expect(items[0].endTime).toBe('24:00:00')
  })

  it('is empty without a schedule', () => {
    expect(scheduleToItems(undefined)).toEqual([])
  })
})

describe('scheduleWindow', () => {
  it('keeps the default hours and widens them to fit late bookings', () => {
    expect(scheduleWindow([])).toEqual({ openTime: '06:00:00', closeTime: '22:00:00' })
    expect(scheduleWindow([item({ startTime: '05:30:00', endTime: '23:30:00' })])).toEqual({
      openTime: '05:00:00',
      closeTime: '24:00:00',
    })
  })
})

describe('deriveCourtBoard', () => {
  const courts = [
    { id: 1, name: 'Court 1' },
    { id: 2, name: 'Court 2' },
    { id: 3, name: 'Court 3' },
    { id: 4, name: 'Court 4' },
  ]
  const items = [
    item({ courtId: 1, status: 'CHECKED_IN', startTime: '10:00:00', endTime: '11:00:00' }),
    item({ bookingId: 2, courtId: 2, status: 'CHECKED_IN', startTime: '10:00:00', endTime: '10:35:00' }),
    item({ bookingId: 3, courtId: 3, status: 'CONFIRMED', startTime: '10:20:00', endTime: '11:00:00' }),
  ]

  it('tells playing, ending soon, booked and free courts apart', () => {
    const board = deriveCourtBoard(courts, items, 10 * 60 + 28)
    expect(board.map((c) => c.status)).toEqual(['PLAYING', 'ENDING_SOON', 'BOOKED_NOT_CHECKED_IN', 'FREE'])
    expect(board[0]).toMatchObject({ bookingId: 1, minutesRemaining: 32 })
    expect(board[1].minutesRemaining).toBe(7)
    expect(board[3].bookingId).toBeNull()
  })
})

const slots: CourtSlot[] = [
  { slotId: 1, startTime: '08:00', endTime: '08:30', price: 50000, status: 'AVAILABLE' },
  { slotId: 2, startTime: '08:30', endTime: '09:00', price: 50000, status: 'AVAILABLE' },
  { slotId: 3, startTime: '09:00', endTime: '09:30', price: 60000, status: 'BOOKED' },
  { slotId: 4, startTime: '09:30', endTime: '10:00', price: 60000, status: 'AVAILABLE' },
]

describe('toggleWalkInSlot', () => {
  it('extends next to the selection, restarts elsewhere and ignores booked slots', () => {
    expect(toggleWalkInSlot(1, [], slots)).toEqual([1])
    expect(toggleWalkInSlot(2, [1], slots)).toEqual([1, 2])
    expect(toggleWalkInSlot(4, [1, 2], slots)).toEqual([4])
    expect(toggleWalkInSlot(3, [1], slots)).toEqual([1])
    expect(toggleWalkInSlot(2, [1, 2], slots)).toEqual([1])
  })
})

describe('summarizeWalkIn', () => {
  it('totals the price and spans the time range', () => {
    expect(summarizeWalkIn([2, 1], slots)).toMatchObject({ total: 100000, startTime: '08:00', endTime: '09:00' })
    expect(summarizeWalkIn([], slots)).toMatchObject({ total: 0, startTime: null, endTime: null })
  })
})

describe('dates', () => {
  it('formats today in the business time zone', () => {
    expect(todayIso(new Date('2026-11-09T18:00:00Z'))).toBe('2026-11-10')
  })

  it('finds the Monday of a week and adds days', () => {
    expect(weekStartOf('2026-11-09')).toBe('2026-11-09')
    expect(weekStartOf('2026-11-15')).toBe('2026-11-09')
    expect(addDays('2026-11-09', 6)).toBe('2026-11-15')
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
  })
})
