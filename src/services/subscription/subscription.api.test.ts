import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import {
  createSubscriptionCheckout,
  getMyActiveSubscription,
  getSubscriptionPayment,
  getSubscriptionPlans,
} from './subscription.api'

vi.mock('@/services/http/axios-client', () => ({ axiosClient: { get: vi.fn(), post: vi.fn() } }))

const http = vi.mocked(axiosClient)

describe('subscription.api', () => {
  beforeEach(() => vi.resetAllMocks())

  it('lists plans on sale from /subscription-plans/all', async () => {
    http.get.mockResolvedValue({ data: [{ id: 1 }] })
    await expect(getSubscriptionPlans()).resolves.toEqual([{ id: 1 }])
    expect(http.get).toHaveBeenCalledWith('/subscription-plans/all')
  })

  it('reads the current subscription', async () => {
    http.get.mockResolvedValue({ data: { id: 3, starter: true, upcoming: [] } })
    await expect(getMyActiveSubscription()).resolves.toMatchObject({ starter: true })
    expect(http.get).toHaveBeenCalledWith('/subscriptions/my-subscription')
  })

  it('creates a checkout with plan and billing cycle', async () => {
    http.post.mockResolvedValue({ data: { orderCode: 99, status: 'PENDING' } })
    await createSubscriptionCheckout({ planId: 2, billingCycle: 'YEARLY' })
    expect(http.post).toHaveBeenCalledWith('/subscriptions/checkout', { planId: 2, billingCycle: 'YEARLY' })
  })

  it('polls a payment by order code', async () => {
    http.get.mockResolvedValue({ data: { orderCode: 99, status: 'PAID' } })
    await expect(getSubscriptionPayment(99)).resolves.toMatchObject({ status: 'PAID' })
    expect(http.get).toHaveBeenCalledWith('/subscriptions/payments/99')
  })
})
