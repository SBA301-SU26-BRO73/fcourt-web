import { axiosClient } from '@/services/http/axios-client'
import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import type { TimeSlotTemplate } from '@/types/booking'

export async function getTemplatesByCourt(courtId: number): Promise<TimeSlotTemplate[]> {
  const { data } = await axiosClient.get<TimeSlotTemplate[]>(
    API_ENDPOINTS.timeSlotTemplates.byCourt(courtId),
  )
  return data
}
