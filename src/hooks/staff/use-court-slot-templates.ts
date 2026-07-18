import { useQuery } from '@tanstack/react-query'

import { getTemplatesByCourt } from '@/services/time-slot/time-slot.api'
import type { TimeSlotTemplate } from '@/types/booking'

export function useCourtSlotTemplates(courtId: number | null) {
  const todayDow = new Date().getDay()

  const query = useQuery({
    queryKey: ['court-templates', courtId],
    queryFn: () => getTemplatesByCourt(courtId as number),
    enabled: courtId != null,
    staleTime: 5 * 60_000,
    select: (data: TimeSlotTemplate[]) =>
      data
        .filter((t) => t.active && t.dayOfWeek === todayDow)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  })

  return {
    templates: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
