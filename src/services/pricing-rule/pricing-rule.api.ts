import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { PricingRule, PricingRuleRequest } from '@/types/pricing-rule'

export async function getPricingRules(courtId: number) {
  const response = await axiosClient.get<PricingRule[]>(API_ENDPOINTS.pricingRules.list(courtId))
  return response.data
}

export async function createPricingRule(courtId: number, payload: PricingRuleRequest) {
  const response = await axiosClient.post<PricingRule>(API_ENDPOINTS.pricingRules.list(courtId), payload)
  return response.data
}

export async function updatePricingRule(courtId: number, ruleId: number, payload: PricingRuleRequest) {
  const response = await axiosClient.put<PricingRule>(API_ENDPOINTS.pricingRules.detail(courtId, ruleId), payload)
  return response.data
}

export async function deletePricingRule(courtId: number, ruleId: number) {
  await axiosClient.delete(API_ENDPOINTS.pricingRules.detail(courtId, ruleId))
}

/** Replaces the weekend rules by copies of the weekday rules, optionally scaled by `priceMultiplier`. */
export async function copyWeekdayToWeekend(courtId: number, priceMultiplier?: number) {
  const response = await axiosClient.post<PricingRule[]>(
    API_ENDPOINTS.pricingRules.copyWeekdayToWeekend(courtId),
    priceMultiplier === undefined ? {} : { priceMultiplier },
  )
  return response.data
}
