import type { ActiveHold } from '@/types/hold'
import { isHoldExpired } from '@/utils/hold-countdown'

/**
 * idle      no hold
 * holding   POST hold-slots in flight
 * active    hold owned, counting down to its absolute expiry
 * releasing DELETE hold-slots in flight (the hold is already gone locally)
 * expired   the TTL passed; the page tells the customer and goes back to idle on the next pick
 */
export type HoldStatus = 'idle' | 'holding' | 'active' | 'releasing' | 'expired'

export interface HoldState {
  status: HoldStatus
  hold: ActiveHold | null
}

export type HoldAction =
  | { type: 'HOLD_REQUESTED' }
  | { type: 'HOLD_SUCCEEDED'; hold: ActiveHold }
  | { type: 'HOLD_FAILED' }
  | { type: 'RESTORED'; hold: ActiveHold }
  | { type: 'TICK'; now: number }
  | { type: 'RELEASE_REQUESTED' }
  | { type: 'RELEASE_SETTLED' }
  | { type: 'RESET' }

export const initialHoldState: HoldState = { status: 'idle', hold: null }

export function holdReducer(state: HoldState, action: HoldAction): HoldState {
  switch (action.type) {
    case 'HOLD_REQUESTED':
      return state.status === 'active' || state.status === 'holding' ? state : { status: 'holding', hold: null }
    case 'HOLD_SUCCEEDED':
      return state.status === 'holding' ? { status: 'active', hold: action.hold } : state
    case 'HOLD_FAILED':
      return state.status === 'holding' ? initialHoldState : state
    case 'RESTORED':
      return state.status === 'idle' && !isHoldExpired(action.hold.expiresAt)
        ? { status: 'active', hold: action.hold }
        : state
    case 'TICK':
      return state.status === 'active' && state.hold && isHoldExpired(state.hold.expiresAt, action.now)
        ? { status: 'expired', hold: null }
        : state
    case 'RELEASE_REQUESTED':
      return state.status === 'active' ? { status: 'releasing', hold: null } : state
    case 'RELEASE_SETTLED':
      return state.status === 'releasing' ? initialHoldState : state
    case 'RESET':
      return initialHoldState
    default:
      return state
  }
}
