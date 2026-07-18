import { createContext, useContext } from 'react'

import { env } from '@/common/config/env'

/**
 * Front-desk staff session.
 *
 * Real auth does not exist yet, so we hold the acting staff's `staffUserId`
 * (the User id the schedule/check-in endpoints expect) and `branchId`, seeded
 * from env and persisted to localStorage. This is the single seam to replace
 * once login lands — swap the seed/persistence for the auth store and the rest
 * of the feature keeps using `useStaffSession()` unchanged.
 */
export interface StaffSession {
  staffUserId: number | null
  branchId: number | null
}

export interface StaffSessionContextValue extends StaffSession {
  setSession: (session: StaffSession) => void
}

export const STAFF_SESSION_STORAGE_KEY = 'bro73.staffSession'

export const StaffSessionContext =
  createContext<StaffSessionContextValue | null>(null)

function parseId(value: string): number | null {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function readInitialSession(): StaffSession {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(STAFF_SESSION_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StaffSession
        return {
          staffUserId: parsed.staffUserId ?? null,
          branchId: parsed.branchId ?? null,
        }
      } catch {
        // fall through to env seed
      }
    }
  }
  return {
    staffUserId: parseId(env.staffUserId),
    branchId: parseId(env.branchId),
  }
}

export function useStaffSession(): StaffSessionContextValue {
  const ctx = useContext(StaffSessionContext)
  if (!ctx) {
    throw new Error('useStaffSession must be used within a StaffSessionProvider')
  }
  return ctx
}
