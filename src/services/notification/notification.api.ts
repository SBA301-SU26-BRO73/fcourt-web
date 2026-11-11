import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { NotificationPage } from '@/types/notification'

/** Newest first. */
export async function getMyNotifications(page = 0, size = 10) {
  const { data } = await axiosClient.get<NotificationPage>(API_ENDPOINTS.notifications.mine, {
    params: { page, size },
  })
  return data
}

export async function getUnreadNotificationCount() {
  const { data } = await axiosClient.get<{ count: number }>(API_ENDPOINTS.notifications.unreadCount)
  return data.count
}

export async function markNotificationRead(id: number) {
  await axiosClient.patch(API_ENDPOINTS.notifications.read(id))
}

export async function markAllNotificationsRead() {
  const { data } = await axiosClient.patch<{ updated: number }>(API_ENDPOINTS.notifications.readAll)
  return data.updated
}
