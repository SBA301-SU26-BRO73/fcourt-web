import { useQuery } from '@tanstack/react-query'

import { getTodaySchedule } from '@/services/staff/staff.api'
import { useStaffSession } from '@/context/staff-session'

/** Query key for the front-desk schedule, granular per staff + date. */
export function scheduleQueryKey(staffUserId: number | null, date?: string) {
  return ['staff-schedule', staffUserId, date ?? 'today'] as const
}

/**
 * Today's booking schedule for the acting staff's branch.
 * Polls so the grid and now-line stay roughly current.
 */
export function useTodaySchedule(date?: string) {
  const { staffUserId } = useStaffSession()

  return useQuery({
    queryKey: scheduleQueryKey(staffUserId, date),
    queryFn: () => getTodaySchedule(staffUserId as number, date),
    enabled: staffUserId != null,
    refetchInterval: 60_000,
  })
}
