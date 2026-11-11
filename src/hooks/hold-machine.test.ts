import { describe, expect, it } from 'vitest'

import type { ActiveHold } from '@/types/hold'

import { holdReducer, initialHoldState, type HoldState } from './hold-machine'

const hold: ActiveHold = {
  holdToken: 't',
  expiresAt: Date.now() + 300_000,
  courtId: 1,
  courtName: 'Sân 1',
  branchId: 2,
  branchName: 'CN',
  date: '2030-01-01',
  guestPhone: '0912345678',
  slots: [{ slotId: 1, startTime: '06:00', endTime: '06:30', price: 50000 }],
}

const active: HoldState = { status: 'active', hold }

describe('hold state machine', () => {
  it('idle -> holding -> active', () => {
    const holding = holdReducer(initialHoldState, { type: 'HOLD_REQUESTED' })
    expect(holding.status).toBe('holding')
    expect(holdReducer(holding, { type: 'HOLD_SUCCEEDED', hold })).toEqual(active)
  })

  it('a failed hold goes back to idle', () => {
    const holding = holdReducer(initialHoldState, { type: 'HOLD_REQUESTED' })
    expect(holdReducer(holding, { type: 'HOLD_FAILED' })).toEqual(initialHoldState)
  })

  it('does not start a second hold while one is active or in flight', () => {
    expect(holdReducer(active, { type: 'HOLD_REQUESTED' })).toBe(active)
    const holding = holdReducer(initialHoldState, { type: 'HOLD_REQUESTED' })
    expect(holdReducer(holding, { type: 'HOLD_REQUESTED' })).toBe(holding)
  })

  it('ticks before the expiry keep the hold, a tick at the expiry ends it', () => {
    expect(holdReducer(active, { type: 'TICK', now: hold.expiresAt - 1 })).toBe(active)
    expect(holdReducer(active, { type: 'TICK', now: hold.expiresAt })).toEqual({ status: 'expired', hold: null })
  })

  it('release drops the hold immediately and settles to idle', () => {
    const releasing = holdReducer(active, { type: 'RELEASE_REQUESTED' })
    expect(releasing).toEqual({ status: 'releasing', hold: null })
    expect(holdReducer(releasing, { type: 'RELEASE_SETTLED' })).toEqual(initialHoldState)
  })

  it('restores a live stored hold but never an expired one', () => {
    expect(holdReducer(initialHoldState, { type: 'RESTORED', hold })).toEqual(active)
    const old = { ...hold, expiresAt: Date.now() - 1 }
    expect(holdReducer(initialHoldState, { type: 'RESTORED', hold: old })).toBe(initialHoldState)
  })

  it('RESET clears the expired banner', () => {
    expect(holdReducer({ status: 'expired', hold: null }, { type: 'RESET' })).toEqual(initialHoldState)
  })
})
