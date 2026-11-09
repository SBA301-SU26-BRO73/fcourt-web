import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { SubscribeRequest, Subscription, SubscriptionPayment, SubscriptionPlan } from '@/types/subscription'

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await axiosClient.get<SubscriptionPlan[]>(
    API_ENDPOINTS.subscriptions.plans,
  )
  return data
}

export async function getMyActiveSubscription(): Promise<Subscription> {
  const { data } = await axiosClient.get<Subscription>(
    API_ENDPOINTS.subscriptions.mySubscription,
  )
  return data
}

export async function createSubscriptionCheckout(payload: SubscribeRequest): Promise<SubscriptionPayment> {
  const { data } = await axiosClient.post<SubscriptionPayment>(
    API_ENDPOINTS.subscriptions.checkout,
    payload,
  )
  return data
}

export async function getSubscriptionPayment(orderCode: number): Promise<SubscriptionPayment> {
  const { data } = await axiosClient.get<SubscriptionPayment>(
    API_ENDPOINTS.subscriptions.payment(orderCode),
  )
  return data
}
