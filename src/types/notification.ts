/** One in-app notification of the signed-in user (notification-service). */
export interface AppNotification {
  id: number
  type: string
  title: string
  body: string
  /** FE route to open on click, for example `/my-bookings`; null when there is nothing to open. */
  link: string | null
  /** Null while unread. */
  readAt: string | null
  createdAt: string
}

export interface NotificationPage {
  items: AppNotification[]
  page: number
  size: number
  total: number
}
