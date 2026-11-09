import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type {  ApplyTimeSlotTemplateRequest,
  ApplyTimeSlotTemplateResponse,
  CreateTimeSlotTemplateRequest,
  TimeSlotTemplateBatchResponse,
  SpringPage,
  TimeSlotListParams,
  TimeSlotTemplate,
  UpdateTimeSlotTemplateRequest,
} from '@/types/time-slot-template'

// TODO(F8): no global list in the backend; templates are read per court (getTimeSlotTemplatesByCourt).
export async function getTimeSlotTemplates(params: TimeSlotListParams) {
  const response = await axiosClient.get<SpringPage<TimeSlotTemplate>>(
    API_ENDPOINTS.timeSlotTemplates.list,
    {
      params: {
        page: params.page,
        size: params.size,
        sort: `${params.sortField},${params.sortDirection}`,
      },
    },
  )
  return response.data
}

// TODO(F8): no get-by-id in the backend.
export async function getTimeSlotTemplateDetail(id: number) {
  const response = await axiosClient.get<TimeSlotTemplate>(
    API_ENDPOINTS.timeSlotTemplates.detail(id),
  )
  return response.data
}

export async function getTimeSlotTemplatesByCourt(courtId: number) {
  const response = await axiosClient.get<TimeSlotTemplate[]>(
    API_ENDPOINTS.timeSlotTemplates.byCourt(courtId),
  )
  return response.data
}

// TODO(F8): templates belong to a court (POST /admin/courts/{courtId}/time-slot-templates, plus /preview).
export async function createTimeSlotTemplate(payload: CreateTimeSlotTemplateRequest) {
  const response = await axiosClient.post<TimeSlotTemplateBatchResponse>(
    API_ENDPOINTS.timeSlotTemplates.list,
    payload,
  )
  return response.data
}

// TODO(F8): no PUT in the backend; delete and recreate instead.
export async function updateTimeSlotTemplate(
  id: number,
  payload: UpdateTimeSlotTemplateRequest,
) {
  const response = await axiosClient.put<TimeSlotTemplate>(
    API_ENDPOINTS.timeSlotTemplates.detail(id),
    payload,
  )
  return response.data
}

export async function deleteTimeSlotTemplate(id: number) {
  await axiosClient.delete(API_ENDPOINTS.timeSlotTemplates.detail(id))
}

export async function applyTimeSlotTemplates(
  targetCourtId: number,
  payload: ApplyTimeSlotTemplateRequest,
) {
  const response = await axiosClient.post<ApplyTimeSlotTemplateResponse>(
    API_ENDPOINTS.timeSlotTemplates.apply(targetCourtId),
    payload,
  )
  return response.data
}
