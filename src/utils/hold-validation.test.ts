import { describe, expect, it } from 'vitest'

import type { ActiveHold } from '@/types/hold'
import type { CourtSlot } from '@/types/public-branch'

import { isHoldOutdated } from './hold-validation'

const hold: ActiveHold = {
  holdToken: 't',
  expiresAt: 10_000,
  courtId: 1,
  courtName: 'S1',
  branchId: 1,
  branchName: 'B',
  date: '2030-01-01',
  guestPhone: '',
  slots: [{ slotId: 7, startTime: '06:00', endTime: '06:30', price: 1 }],
  savedAt: 1_000,
}
const slot = (status: string) => [{ slotId: 7, status }] as unknown as CourtSlot[]

describe('isHoldOutdated', () => {
  it('keeps a hold the grid still shows as HOLD', () => {
    expect(isHoldOutdated(hold, slot('HOLD'), 2_000)).toBe(false)
  })
  it('drops a hold whose slot is free or booked in fresh data', () => {
    expect(isHoldOutdated(hold, slot('AVAILABLE'), 2_000)).toBe(true)
    expect(isHoldOutdated(hold, slot('BOOKED'), 2_000)).toBe(true)
  })
  it('ignores data fetched before the hold existed or no data at all', () => {
    expect(isHoldOutdated(hold, slot('AVAILABLE'), 500)).toBe(false)
    expect(isHoldOutdated(hold, undefined, 2_000)).toBe(false)
    expect(isHoldOutdated(hold, [], 2_000)).toBe(false)
  })
})
