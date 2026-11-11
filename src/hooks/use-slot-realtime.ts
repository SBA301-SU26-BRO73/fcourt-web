import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { env } from '@/common/config/env'
import { createSlotSocket, type SlotSocketStatus } from '@/services/realtime/slot-socket'

import { publicBranchKeys } from './use-public-branches'

/** Safety net while the socket is down (booking-service: "clients resync on connect and periodically"). */
export const FALLBACK_POLL_MS = 15_000

/**
 * Keep the visible court slot grids fresh: every event for a court refetches that court's slots
 * for the event date, every (re)connect refetches all of them over HTTP, and while the socket is
 * down a slow poll keeps the grid correct.
 */
export function useSlotRealtime(courtIds: number[], date: string) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<SlotSocketStatus>('connecting')
  const dateRef = useRef(date)
  useEffect(() => {
    dateRef.current = date
  })

  const courtKey = courtIds.join(',')
  const stableCourtIds = useMemo(() => (courtKey ? courtKey.split(',').map(Number) : []), [courtKey])

  useEffect(() => {
    if (stableCourtIds.length === 0 || !env.wsUrl) return
    const refetchCourt = (courtId: number, day: string) =>
      queryClient.invalidateQueries({ queryKey: publicBranchKeys.slots(courtId, day) })

    const socket = createSlotSocket({
      url: env.wsUrl,
      courtIds: stableCourtIds,
      onStatus: setStatus,
      onChange: (change) => {
        void refetchCourt(change.courtId, change.date)
      },
      onResync: () => {
        for (const courtId of stableCourtIds) void refetchCourt(courtId, dateRef.current)
      },
    })
    return () => socket.close()
  }, [queryClient, stableCourtIds])

  useEffect(() => {
    if (status === 'connected' || stableCourtIds.length === 0) return
    const timer = window.setInterval(() => {
      for (const courtId of stableCourtIds) {
        void queryClient.invalidateQueries({ queryKey: publicBranchKeys.slots(courtId, dateRef.current) })
      }
    }, FALLBACK_POLL_MS)
    return () => window.clearInterval(timer)
  }, [status, queryClient, stableCourtIds])

  return { status }
}
