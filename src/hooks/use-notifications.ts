import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notification/notification.api'

const KEY = ['notifications'] as const

/** How often the bell asks for the unread count (also refreshed when the window gets focus). */
export const UNREAD_POLL_MS = 30_000
/** The dropdown shows the latest notifications only. */
export const DROPDOWN_SIZE = 10

export function useUnreadNotificationCount(enabled = true) {
  return useQuery({
    queryKey: [...KEY, 'unread-count'],
    queryFn: getUnreadNotificationCount,
    enabled,
    refetchInterval: UNREAD_POLL_MS,
    refetchOnWindowFocus: 'always',
    staleTime: 0,
  })
}

export function useLatestNotifications(enabled: boolean) {
  return useQuery({
    queryKey: [...KEY, 'latest'],
    queryFn: () => getMyNotifications(0, DROPDOWN_SIZE),
    enabled,
    refetchOnMount: 'always',
    staleTime: 0,
  })
}

export function useMarkNotificationRead() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSettled: () => client.invalidateQueries({ queryKey: KEY }),
  })
}

export function useMarkAllNotificationsRead() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSettled: () => client.invalidateQueries({ queryKey: KEY }),
  })
}
