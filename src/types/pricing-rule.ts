export type PricingDayType = 'WEEKDAY' | 'WEEKEND'

/** RuleResponse of facility-service. Times are "HH:mm". Day numbers: 0 = Sunday .. 6 = Saturday. */
export interface PricingRule {
  id: number
  courtId: number
  ruleName: string
  startTime: string
  endTime: string
  pricePerHour: number
  peakHour: boolean
  daysOfWeek: number[]
  dayType: PricingDayType
}

/** RuleRequest. A missing daysOfWeek lets the backend apply its default. */
export interface PricingRuleRequest {
  ruleName: string
  startTime: string
  endTime: string
  pricePerHour: number
  peakHour: boolean
  daysOfWeek?: number[]
}
