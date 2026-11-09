import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import { copyWeekdayToWeekend, createPricingRule, deletePricingRule, getPricingRules, updatePricingRule } from './pricing-rule.api'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const http = vi.mocked(axiosClient)
const rule = { ruleName: 'Giờ vàng', startTime: '17:00:00', endTime: '21:00:00', pricePerHour: 180000, peakHour: true, daysOfWeek: [1, 2] }

describe('pricing rule api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('reads, creates, updates and deletes rules under the court', async () => {
    http.get.mockResolvedValue({ data: [] })
    http.post.mockResolvedValue({ data: { id: 1 } })
    http.put.mockResolvedValue({ data: { id: 1 } })
    http.delete.mockResolvedValue({})
    await getPricingRules(4)
    await createPricingRule(4, rule)
    await updatePricingRule(4, 9, rule)
    await deletePricingRule(4, 9)
    expect(http.get).toHaveBeenCalledWith('/admin/courts/4/pricing-rules')
    expect(http.post).toHaveBeenCalledWith('/admin/courts/4/pricing-rules', rule)
    expect(http.put).toHaveBeenCalledWith('/admin/courts/4/pricing-rules/9', rule)
    expect(http.delete).toHaveBeenCalledWith('/admin/courts/4/pricing-rules/9')
  })

  it('copies weekday rules to the weekend with or without a multiplier', async () => {
    http.post.mockResolvedValue({ data: [] })
    await copyWeekdayToWeekend(4)
    await copyWeekdayToWeekend(4, 1.2)
    expect(http.post).toHaveBeenNthCalledWith(1, '/admin/courts/4/pricing-rules/copy-weekday-to-weekend', {})
    expect(http.post).toHaveBeenNthCalledWith(2, '/admin/courts/4/pricing-rules/copy-weekday-to-weekend', { priceMultiplier: 1.2 })
  })
})
