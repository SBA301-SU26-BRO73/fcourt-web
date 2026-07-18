import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { CourtTypeData, CourtTypeRequest, PageResponse } from '@/types/admin'
import type { ApiResponse } from '@/types/auth'

export async function getCourtTypes(): Promise<ApiResponse<PageResponse<CourtTypeData>>> {
  const res = await axiosClient.get(API_ENDPOINTS.courtTypes.list, { params: { size: 100 } })
  return res.data
}

export async function createCourtType(data: CourtTypeRequest): Promise<ApiResponse<CourtTypeData>> {
  const res = await axiosClient.post(API_ENDPOINTS.courtTypes.list, data)
  return res.data
}

export async function updateCourtType(id: number, data: CourtTypeRequest): Promise<ApiResponse<CourtTypeData>> {
  const res = await axiosClient.put(API_ENDPOINTS.courtTypes.update(id), data)
  return res.data
}

export async function deleteCourtType(id: number): Promise<ApiResponse<void>> {
  const res = await axiosClient.delete(API_ENDPOINTS.courtTypes.delete(id))
  return res.data
}
