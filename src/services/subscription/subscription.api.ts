import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { ApiResponse } from '@/types/auth'
import type { SubscribeRequest, Subscription, SubscriptionPlan } from '@/types/subscription'

function requireData<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'The server returned no data.')
  }
  return response.data
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await axiosClient.get<ApiResponse<SubscriptionPlan[]>>(
    API_ENDPOINTS.subscriptions.plans,
  )
  return requireData(data)
}

export async function getMyActiveSubscription(): Promise<Subscription> {
  const { data } = await axiosClient.get<ApiResponse<Subscription>>(
    API_ENDPOINTS.subscriptions.mySubscription,
  )
  return requireData(data)
}

export async function subscribePlan(payload: SubscribeRequest): Promise<Subscription> {
  const { data } = await axiosClient.post<ApiResponse<Subscription>>(
    API_ENDPOINTS.subscriptions.subscribe,
    payload,
  )
  return requireData(data)
}
