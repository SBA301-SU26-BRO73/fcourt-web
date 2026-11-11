import { beforeEach, describe, expect, it } from 'vitest'

import type { ActiveHold } from '@/types/hold'

import { clearActiveHold, loadActiveHold, saveActiveHold } from './hold-storage'

const hold: ActiveHold = {
  holdToken: 't',
  expiresAt: 10_000,
  courtId: 1,
  courtName: 'Sân 1',
  branchId: 2,
  branchName: 'CN',
  date: '2030-01-01',
  guestPhone: '0912345678',
  slots: [{ slotId: 1, startTime: '06:00', endTime: '06:30', price: 50000 }],
}

beforeEach(() => sessionStorage.clear())

describe('hold storage', () => {
  it('round-trips a live hold', () => {
    saveActiveHold(hold)
    expect(loadActiveHold(5_000)).toEqual(hold)
  })

  it('drops an expired hold instead of restoring it', () => {
    saveActiveHold(hold)
    expect(loadActiveHold(10_000)).toBeNull()
    expect(sessionStorage.length).toBe(0)
  })

  it('ignores garbage and clears', () => {
    sessionStorage.setItem('fcourt.activeHold', '{not json')
    expect(loadActiveHold()).toBeNull()
    saveActiveHold(hold)
    clearActiveHold()
    expect(loadActiveHold(0)).toBeNull()
  })
})
