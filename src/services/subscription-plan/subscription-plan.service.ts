import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { PageResponse, PlanData, PlanRequest } from '@/types/admin'

export async function getPlans(): Promise<PageResponse<PlanData>> {
  const res = await axiosClient.get(API_ENDPOINTS.plans.list, { params: { size: 100 } })
  return res.data
}

export async function createPlan(data: PlanRequest): Promise<PlanData> {
  const res = await axiosClient.post(API_ENDPOINTS.plans.list, data)
  return res.data
}

export async function updatePlan(id: number, data: PlanRequest): Promise<PlanData> {
  const res = await axiosClient.put(API_ENDPOINTS.plans.update(id), data)
  return res.data
}

/** 204 No Content. */
export async function deletePlan(id: number): Promise<void> {
  await axiosClient.delete(API_ENDPOINTS.plans.delete(id))
}
