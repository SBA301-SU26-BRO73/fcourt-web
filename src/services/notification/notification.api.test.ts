import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from './notification.api'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: { get: vi.fn(), patch: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

describe('notification api', () => {
  it('lists my notifications with paging', async () => {
    vi.mocked(axiosClient.get).mockResolvedValue({ data: { items: [], page: 0, size: 10, total: 0 } })
    const page = await getMyNotifications(0, 10)
    expect(axiosClient.get).toHaveBeenCalledWith('/notifications/me', { params: { page: 0, size: 10 } })
    expect(page.total).toBe(0)
  })

  it('reads the unread count', async () => {
    vi.mocked(axiosClient.get).mockResolvedValue({ data: { count: 4 } })
    expect(await getUnreadNotificationCount()).toBe(4)
    expect(axiosClient.get).toHaveBeenCalledWith('/notifications/me/unread-count')
  })

  it('marks one and all as read with PATCH', async () => {
    vi.mocked(axiosClient.patch).mockResolvedValueOnce({ data: undefined }).mockResolvedValueOnce({ data: { updated: 3 } })
    await markNotificationRead(7)
    expect(axiosClient.patch).toHaveBeenCalledWith('/notifications/7/read')
    expect(await markAllNotificationsRead()).toBe(3)
    expect(axiosClient.patch).toHaveBeenLastCalledWith('/notifications/me/read-all')
  })
})
