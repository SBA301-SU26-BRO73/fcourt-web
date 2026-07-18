import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { PageResponse, PlanData, PlanRequest } from '@/types/admin'
import type { ApiResponse } from '@/types/auth'

export async function getPlans(): Promise<ApiResponse<PageResponse<PlanData>>> {
  const res = await axiosClient.get(API_ENDPOINTS.plans.list, { params: { size: 100 } })
  return res.data
}

export async function createPlan(data: PlanRequest): Promise<ApiResponse<PlanData>> {
  const res = await axiosClient.post(API_ENDPOINTS.plans.list, data)
  return res.data
}

export async function updatePlan(id: number, data: PlanRequest): Promise<ApiResponse<PlanData>> {
  const res = await axiosClient.put(API_ENDPOINTS.plans.update(id), data)
  return res.data
}

export async function deletePlan(id: number): Promise<ApiResponse<void>> {
  const res = await axiosClient.delete(API_ENDPOINTS.plans.delete(id))
  return res.data
}
