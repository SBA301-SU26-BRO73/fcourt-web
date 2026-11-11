import type { PricingRule, PricingRuleRequest } from '@/types/pricing-rule'

const SLOT_MINUTES = 30

export interface PricingRuleFormValues {
  ruleName: string
  startTime: string
  endTime: string
  pricePerHour: string
  peakHour: boolean
  daysOfWeek: string[]
}

export type PricingRuleFormErrors = Partial<Record<keyof PricingRuleFormValues, string>>

/** Monday to Friday; the weekend is usually set by copying the weekday rules. */
export const emptyPricingRuleFormValues: PricingRuleFormValues = {
  ruleName: '',
  startTime: '17:00',
  endTime: '21:00',
  pricePerHour: '',
  peakHour: false,
  daysOfWeek: ['1', '2', '3', '4', '5'],
}

export function pricingRuleToFormValues(rule: PricingRule): PricingRuleFormValues {
  return {
    ruleName: rule.ruleName,
    startTime: rule.startTime.slice(0, 5),
    endTime: rule.endTime.slice(0, 5),
    pricePerHour: String(rule.pricePerHour),
    peakHour: rule.peakHour,
    daysOfWeek: rule.daysOfWeek.map(String),
  }
}

function toMinutes(value: string) {
  const [hour = '0', minute = '0'] = value.split(':')
  return Number(hour) * 60 + Number(minute)
}

function toApiTime(value: string) {
  return value.length === 5 ? `${value}:00` : value
}

export function validatePricingRuleForm(values: PricingRuleFormValues): PricingRuleFormErrors {
  const errors: PricingRuleFormErrors = {}
  const name = values.ruleName.trim()
  if (!name) errors.ruleName = 'Tên quy tắc là bắt buộc.'
  else if (name.length > 100) errors.ruleName = 'Tên quy tắc tối đa 100 ký tự.'

  if (!values.startTime) errors.startTime = 'Giờ bắt đầu là bắt buộc.'
  else if (toMinutes(values.startTime) % SLOT_MINUTES !== 0) errors.startTime = 'Giờ phải tròn 00 hoặc 30 phút.'
  if (!values.endTime) errors.endTime = 'Giờ kết thúc là bắt buộc.'
  else if (toMinutes(values.endTime) % SLOT_MINUTES !== 0) errors.endTime = 'Giờ phải tròn 00 hoặc 30 phút.'
  else if (values.startTime && toMinutes(values.endTime) <= toMinutes(values.startTime)) {
    errors.endTime = 'Giờ kết thúc phải sau giờ bắt đầu.'
  }

  const raw = values.pricePerHour.trim()
  const price = Number(raw)
  if (!raw) errors.pricePerHour = 'Giá là bắt buộc.'
  else if (!Number.isFinite(price) || price <= 0) errors.pricePerHour = 'Giá phải lớn hơn 0.'
  else if (!/^\d+(\.\d{1,2})?$/.test(raw)) errors.pricePerHour = 'Giá chỉ được có tối đa 2 chữ số thập phân.'
  else if (price > 99_999_999.99) errors.pricePerHour = 'Giá vượt quá giới hạn lưu trữ.'

  if (values.daysOfWeek.length === 0) errors.daysOfWeek = 'Chọn ít nhất một ngày.'
  return errors
}

export function toPricingRuleRequest(values: PricingRuleFormValues): PricingRuleRequest {
  return {
    ruleName: values.ruleName.trim(),
    startTime: toApiTime(values.startTime),
    endTime: toApiTime(values.endTime),
    pricePerHour: Number(values.pricePerHour),
    peakHour: values.peakHour,
    daysOfWeek: values.daysOfWeek.map(Number).sort((a, b) => a - b),
  }
}

/** Empty = no scaling; otherwise a positive multiplier such as 1.2. */
export function parseMultiplier(raw: string): { value?: number; error?: string } {
  const text = raw.trim()
  if (!text) return {}
  const value = Number(text)
  if (!Number.isFinite(value) || value <= 0) return { error: 'Hệ số phải lớn hơn 0.' }
  if (!/^\d{1,4}(\.\d{1,4})?$/.test(text)) return { error: 'Hệ số tối đa 4 chữ số nguyên và 4 chữ số thập phân.' }
  return { value }
}
