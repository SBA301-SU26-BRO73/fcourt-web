import { useCallback, useEffect, useReducer, useRef, useState } from 'react'

import { holdSlots, releaseHold } from '@/services/hold/hold.api'
import type { ActiveHold, HeldSlot } from '@/types/hold'
import { isHoldWarning, remainingSeconds } from '@/utils/hold-countdown'
import { clearActiveHold, loadActiveHold, saveActiveHold } from '@/utils/hold-storage'

import { holdReducer, initialHoldState, type HoldState } from './hold-machine'

export interface StartHoldInput {
  courtId: number
  courtName: string
  branchId: number | null
  branchName: string
  date: string
  guestPhone: string
  slots: HeldSlot[]
}

interface Options {
  /** Called once when the TTL passes while the hold is active. */
  onExpired?: () => void
}

function initialState(): HoldState {
  const stored = loadActiveHold()
  return stored ? { status: 'active', hold: stored } : initialHoldState
}

/**
 * Owns the customer's slot hold: create (POST hold-slots), release (DELETE) and a countdown
 * derived from the absolute server expiry. The hold survives a reload through sessionStorage.
 */
export function useSlotHold({ onExpired }: Options = {}) {
  const [state, dispatch] = useReducer(holdReducer, undefined, initialState)
  const [now, setNow] = useState(() => Date.now())
  const onExpiredRef = useRef(onExpired)
  useEffect(() => {
    onExpiredRef.current = onExpired
  })

  const { status, hold } = state

  useEffect(() => {
    if (status !== 'active') return
    const tick = () => {
      const current = Date.now()
      setNow(current)
      dispatch({ type: 'TICK', now: current })
    }
    const timer = window.setInterval(tick, 1000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [status])

  const expiredNotified = useRef(false)
  useEffect(() => {
    if (status === 'expired') {
      clearActiveHold()
      if (!expiredNotified.current) {
        expiredNotified.current = true
        onExpiredRef.current?.()
      }
    } else {
      expiredNotified.current = false
    }
  }, [status])

  const start = useCallback(async (input: StartHoldInput): Promise<ActiveHold> => {
    dispatch({ type: 'HOLD_REQUESTED' })
    try {
      const { holdToken, expiresAt } = await holdSlots({
        courtId: input.courtId,
        date: input.date,
        slotIds: input.slots.map((slot) => slot.slotId),
        guestPhone: input.guestPhone,
      })
      const created: ActiveHold = {
        holdToken,
        expiresAt,
        courtId: input.courtId,
        courtName: input.courtName,
        branchId: input.branchId,
        branchName: input.branchName,
        date: input.date,
        guestPhone: input.guestPhone,
        slots: input.slots,
      }
      saveActiveHold(created)
      setNow(Date.now())
      dispatch({ type: 'HOLD_SUCCEEDED', hold: created })
      return created
    } catch (error) {
      dispatch({ type: 'HOLD_FAILED' })
      throw error
    }
  }, [])

  const release = useCallback(async () => {
    if (!hold) return
    const token = hold.holdToken
    dispatch({ type: 'RELEASE_REQUESTED' })
    clearActiveHold()
    try {
      await releaseHold(token)
    } finally {
      // The hold is dropped locally either way; an unreleased one simply expires on the server.
      dispatch({ type: 'RELEASE_SETTLED' })
    }
  }, [hold])

  const dismissExpired = useCallback(() => dispatch({ type: 'RESET' }), [])

  const remaining = hold ? remainingSeconds(hold.expiresAt, now) : 0

  return {
    status,
    hold,
    remaining,
    isWarning: isHoldWarning(remaining),
    isBusy: status === 'holding' || status === 'releasing',
    start,
    release,
    dismissExpired,
  }
}
