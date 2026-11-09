import { createContext, useContext } from 'react'

/**
 * Front-desk staff session, derived from the JWT: `staffUserId` is the
 * logged-in user's id (from auth context), `branchId`/`branchName` come from
 * `GET /api/staff/me` (branch name from the public branch), resolved server-side from the same token.
 */
export interface StaffSession {
  staffUserId: number | null
  branchId: number | null
  branchName: string | null
  isLoading: boolean
}

export const StaffSessionContext = createContext<StaffSession | null>(null)

export function useStaffSession(): StaffSession {
  const ctx = useContext(StaffSessionContext)
  if (!ctx) {
    throw new Error('useStaffSession must be used within a StaffSessionProvider')
  }
  return ctx
}
