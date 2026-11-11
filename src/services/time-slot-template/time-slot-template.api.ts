import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type {
  ApplyTimeSlotTemplateRequest,
  ApplyTimeSlotTemplateResponse,
  BulkApplyResponse,
  BulkApplyTemplateRequest,
  BulkPreviewResponse,
  CreateTimeSlotTemplateRequest,
  TemplatePreviewResponse,
  TimeSlotTemplate,
  UpdateTimeSlotTemplateRequest,
} from '@/types/time-slot-template'

/** Templates exist per court only: there is no global list and no get-by-id. */
export async function getTimeSlotTemplatesByCourt(courtId: number, dayOfWeek?: number) {
  const response = await axiosClient.get<TimeSlotTemplate[]>(
    API_ENDPOINTS.timeSlotTemplates.byCourt(courtId),
    dayOfWeek === undefined ? undefined : { params: { dayOfWeek } },
  )
  return response.data
}

/** One 30-minute slot on one day. */
export async function createTimeSlotTemplate(courtId: number, payload: CreateTimeSlotTemplateRequest) {
  const response = await axiosClient.post<TimeSlotTemplate>(
    API_ENDPOINTS.timeSlotTemplates.byCourt(courtId),
    payload,
  )
  return response.data
}

/** Depends on the backend PR adding PUT /api/admin/time-slot-templates/{id}. */
export async function updateTimeSlotTemplate(id: number, payload: UpdateTimeSlotTemplateRequest) {
  const response = await axiosClient.put<TimeSlotTemplate>(API_ENDPOINTS.timeSlotTemplates.detail(id), payload)
  return response.data
}

export async function deleteTimeSlotTemplate(id: number) {
  await axiosClient.delete(API_ENDPOINTS.timeSlotTemplates.detail(id))
}

/** Dry run: the slots `applyTimeSlotTemplate` would generate. */
export async function previewTimeSlotTemplate(courtId: number, payload: ApplyTimeSlotTemplateRequest) {
  const response = await axiosClient.post<TemplatePreviewResponse>(
    API_ENDPOINTS.timeSlotTemplates.preview(courtId),
    payload,
  )
  return response.data
}

/** Replaces the templates of every chosen day of the court by the generated 30-minute slots. */
export async function applyTimeSlotTemplate(courtId: number, payload: ApplyTimeSlotTemplateRequest) {
  const response = await axiosClient.post<ApplyTimeSlotTemplateResponse>(
    API_ENDPOINTS.timeSlotTemplates.apply(courtId),
    payload,
  )
  return response.data
}

export async function previewBulkTimeSlotTemplate(payload: BulkApplyTemplateRequest) {
  const response = await axiosClient.post<BulkPreviewResponse>(API_ENDPOINTS.timeSlotTemplates.bulkPreview, payload)
  return response.data
}

/** All or nothing: one court that cannot take the template answers 409 and nothing is written. */
export async function bulkApplyTimeSlotTemplate(payload: BulkApplyTemplateRequest) {
  const response = await axiosClient.post<BulkApplyResponse>(API_ENDPOINTS.timeSlotTemplates.bulkApply, payload)
  return response.data
}
