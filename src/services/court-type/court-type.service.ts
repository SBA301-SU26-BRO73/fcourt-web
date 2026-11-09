import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { CourtTypeData, CourtTypeRequest, PageResponse } from '@/types/admin'

export async function getCourtTypes(): Promise<PageResponse<CourtTypeData>> {
  const res = await axiosClient.get(API_ENDPOINTS.courtTypes.list, { params: { size: 100 } })
  return res.data
}

export async function createCourtType(data: CourtTypeRequest): Promise<CourtTypeData> {
  const res = await axiosClient.post(API_ENDPOINTS.courtTypes.list, data)
  return res.data
}

export async function updateCourtType(id: number, data: CourtTypeRequest): Promise<CourtTypeData> {
  const res = await axiosClient.put(API_ENDPOINTS.courtTypes.update(id), data)
  return res.data
}

export async function deleteCourtType(id: number): Promise<void> {
  const res = await axiosClient.delete(API_ENDPOINTS.courtTypes.delete(id))
  return res.data
}
