import { useQuery } from '@tanstack/react-query'

import { getWeekSchedule } from '@/services/staff/counter.api'
import { useStaffSession } from '@/context/staff-session'
import { addDays } from '@/pages/staff/counter-utils'

/** Week schedule (Monday to Sunday) starting at `weekStart` (yyyy-MM-dd). */
export function useWeekSchedule(weekStart: string, enabled = true) {
  const { staffUserId } = useStaffSession()

  return useQuery({
    queryKey: ['staff-schedule', staffUserId, 'week', weekStart],
    queryFn: () => getWeekSchedule(weekStart, addDays(weekStart, 6)),
    enabled: enabled && staffUserId != null,
    refetchInterval: 60_000,
  })
}
