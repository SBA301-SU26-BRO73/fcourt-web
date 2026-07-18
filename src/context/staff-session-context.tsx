import {
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

import {
  StaffSessionContext,
  STAFF_SESSION_STORAGE_KEY,
  readInitialSession,
  type StaffSession,
  type StaffSessionContextValue,
} from '@/context/staff-session'

export function StaffSessionProvider({ children }: PropsWithChildren) {
  const [session, setSessionState] = useState<StaffSession>(readInitialSession)

  const setSession = useCallback((next: StaffSession) => {
    setSessionState(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STAFF_SESSION_STORAGE_KEY, JSON.stringify(next))
    }
  }, [])

  const value = useMemo<StaffSessionContextValue>(
    () => ({ ...session, setSession }),
    [session, setSession],
  )

  return (
    <StaffSessionContext.Provider value={value}>
      {children}
    </StaffSessionContext.Provider>
  )
}
