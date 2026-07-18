import { axiosClient } from '@/services/http/axios-client'
import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import type { ApiResponse } from '@/types/auth'
import type { TimeSlotTemplate } from '@/types/booking'

export async function getTemplatesByCourt(courtId: number): Promise<TimeSlotTemplate[]> {
  const { data } = await axiosClient.get<ApiResponse<TimeSlotTemplate[]>>(
    API_ENDPOINTS.timeSlotTemplates.byCourt(courtId),
  )
  if (data.data === undefined) {
    throw new Error(data.message || 'The server returned no data.')
  }
  return data.data
}
