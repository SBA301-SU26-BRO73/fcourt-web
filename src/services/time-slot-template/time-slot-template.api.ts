import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type {
  ApiResponse,
  ApplyTimeSlotTemplateRequest,
  ApplyTimeSlotTemplateResponse,
  CreateTimeSlotTemplateRequest,
  SpringPage,
  TimeSlotListParams,
  TimeSlotTemplate,
  UpdateTimeSlotTemplateRequest,
} from '@/types/time-slot-template'

function requireData<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'The server returned no data.')
  }
  return response.data
}

export async function getTimeSlotTemplates(params: TimeSlotListParams) {
  const response = await axiosClient.get<ApiResponse<SpringPage<TimeSlotTemplate>>>(
    API_ENDPOINTS.timeSlotTemplates.list,
    {
      params: {
        page: params.page,
        size: params.size,
        sort: `${params.sortField},${params.sortDirection}`,
      },
    },
  )
  return requireData(response.data)
}

export async function getTimeSlotTemplateDetail(id: number) {
  const response = await axiosClient.get<ApiResponse<TimeSlotTemplate>>(
    API_ENDPOINTS.timeSlotTemplates.detail(id),
  )
  return requireData(response.data)
}

export async function getTimeSlotTemplatesByCourt(courtId: number) {
  const response = await axiosClient.get<ApiResponse<TimeSlotTemplate[]>>(
    API_ENDPOINTS.timeSlotTemplates.byCourt(courtId),
  )
  return requireData(response.data)
}

export async function createTimeSlotTemplate(payload: CreateTimeSlotTemplateRequest) {
  const response = await axiosClient.post<ApiResponse<TimeSlotTemplate>>(
    API_ENDPOINTS.timeSlotTemplates.list,
    payload,
  )
  return requireData(response.data)
}

export async function updateTimeSlotTemplate(
  id: number,
  payload: UpdateTimeSlotTemplateRequest,
) {
  const response = await axiosClient.put<ApiResponse<TimeSlotTemplate>>(
    API_ENDPOINTS.timeSlotTemplates.detail(id),
    payload,
  )
  return requireData(response.data)
}

export async function deleteTimeSlotTemplate(id: number) {
  await axiosClient.delete(API_ENDPOINTS.timeSlotTemplates.detail(id))
}

export async function applyTimeSlotTemplates(
  targetCourtId: number,
  payload: ApplyTimeSlotTemplateRequest,
) {
  const response = await axiosClient.post<ApiResponse<ApplyTimeSlotTemplateResponse>>(
    API_ENDPOINTS.timeSlotTemplates.apply(targetCourtId),
    payload,
  )
  return requireData(response.data)
}
