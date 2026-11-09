import { describe, expect, it } from 'vitest'

import {
  emptyPricingRuleFormValues,
  parseMultiplier,
  pricingRuleToFormValues,
  toPricingRuleRequest,
  validatePricingRuleForm,
  type PricingRuleFormValues,
} from './pricing-rule-form.utils'

const valid: PricingRuleFormValues = { ...emptyPricingRuleFormValues, ruleName: 'Giờ vàng', pricePerHour: '180000', peakHour: true }

describe('validatePricingRuleForm', () => {
  it('accepts a complete rule', () => {
    expect(validatePricingRuleForm(valid)).toEqual({})
  })

  it('requires a name, a price and at least one day', () => {
    const errors = validatePricingRuleForm({ ...valid, ruleName: ' ', pricePerHour: '', daysOfWeek: [] })
    expect(errors).toMatchObject({ ruleName: expect.any(String), pricePerHour: expect.any(String), daysOfWeek: expect.any(String) })
  })

  it('keeps times on the 30-minute grid and in order', () => {
    expect(validatePricingRuleForm({ ...valid, startTime: '17:15' }).startTime).toBeTruthy()
    expect(validatePricingRuleForm({ ...valid, endTime: '16:00' }).endTime).toBeTruthy()
  })

  it('checks the price range and decimals', () => {
    expect(validatePricingRuleForm({ ...valid, pricePerHour: '0' }).pricePerHour).toBeTruthy()
    expect(validatePricingRuleForm({ ...valid, pricePerHour: '1.234' }).pricePerHour).toBeTruthy()
    expect(validatePricingRuleForm({ ...valid, pricePerHour: '100000000' }).pricePerHour).toBeTruthy()
  })
})

describe('request mapping', () => {
  it('builds the request with sorted days and API times', () => {
    expect(toPricingRuleRequest({ ...valid, ruleName: ' Giờ vàng ', daysOfWeek: ['6', '0'] })).toEqual({
      ruleName: 'Giờ vàng',
      startTime: '17:00:00',
      endTime: '21:00:00',
      pricePerHour: 180000,
      peakHour: true,
      daysOfWeek: [0, 6],
    })
  })

  it('fills the form from a rule', () => {
    const values = pricingRuleToFormValues({
      id: 1, courtId: 2, ruleName: 'Cuối tuần', startTime: '06:00', endTime: '22:00', pricePerHour: 200000,
      peakHour: false, daysOfWeek: [0, 6], dayType: 'WEEKEND',
    })
    expect(values).toMatchObject({ ruleName: 'Cuối tuần', pricePerHour: '200000', daysOfWeek: ['0', '6'] })
  })
})

describe('parseMultiplier', () => {
  it('treats empty as no scaling and rejects bad values', () => {
    expect(parseMultiplier('')).toEqual({})
    expect(parseMultiplier('1.2')).toEqual({ value: 1.2 })
    expect(parseMultiplier('0').error).toBeTruthy()
    expect(parseMultiplier('abc').error).toBeTruthy()
    expect(parseMultiplier('1.23456').error).toBeTruthy()
  })
})
