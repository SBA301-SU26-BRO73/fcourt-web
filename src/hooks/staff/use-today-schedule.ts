import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getTodaySchedule } from '@/services/staff/counter.api'
import { useStaffSession } from '@/context/staff-session'
import { scheduleToItems } from '@/pages/staff/counter-utils'

/** Query key for the front-desk schedule, granular per staff. */
export function scheduleQueryKey(staffUserId: number | null) {
  return ['staff-schedule', staffUserId, 'today'] as const
}

/**
 * Today's booking schedule of the staff's branch (resolved server-side from the JWT), one block
 * per booking. Polls so the grid and now-line stay roughly current.
 */
export function useTodaySchedule() {
  const { staffUserId } = useStaffSession()

  const query = useQuery({
    queryKey: scheduleQueryKey(staffUserId),
    queryFn: getTodaySchedule,
    enabled: staffUserId != null,
    refetchInterval: 60_000,
  })

  const data = useMemo(() => (query.data ? scheduleToItems(query.data) : undefined), [query.data])

  return { ...query, data }
}
