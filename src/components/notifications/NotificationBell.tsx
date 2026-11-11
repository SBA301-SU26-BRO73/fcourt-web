import { Bell, CheckCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  useLatestNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadNotificationCount,
} from '@/hooks/use-notifications'
import { useAuth } from '@/hooks/use-auth-context'
import type { AppNotification } from '@/types/notification'
import { formatRelativeTime } from '@/utils/relative-time'
import { safeInternalLink } from '@/utils/safe-link'

interface NotificationBellProps {
  /** Classes of the trigger button, so each layout keeps its own look. */
  className?: string
}

const DEFAULT_TRIGGER =
  'relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700'

/** Bell with an unread badge and a dropdown of the latest notifications, for every signed-in role. */
export function NotificationBell({ className }: NotificationBellProps) {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  const unread = useUnreadNotificationCount(isLoggedIn)
  const latest = useLatestNotifications(isLoggedIn && open)
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!isLoggedIn) return null

  const count = unread.data ?? 0
  const items = latest.data?.items ?? []

  function openNotification(item: AppNotification) {
    if (!item.readAt) markRead.mutate(item.id)
    setOpen(false)
    const target = safeInternalLink(item.link)
    if (target) navigate(target)
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label={count > 0 ? `Thông báo, ${count} chưa đọc` : 'Thông báo'}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={className ?? DEFAULT_TRIGGER}
      >
        <Bell size={18} />
        {count > 0 && (
          <span
            data-testid="notification-badge"
            className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Thông báo"
          className="absolute right-0 top-full z-50 mt-2 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-xl"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-bold text-slate-900">Thông báo</span>
            <button
              type="button"
              onClick={() => markAll.mutate()}
              disabled={count === 0 || markAll.isPending}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-700 transition hover:text-emerald-900 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              <CheckCheck size={14} />
              Đánh dấu đã đọc tất cả
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {latest.isPending ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">Đang tải thông báo…</p>
            ) : latest.isError ? (
              <p className="px-4 py-8 text-center text-sm text-red-500">Không tải được thông báo. Vui lòng thử lại.</p>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Bell size={28} className="text-slate-300" />
                <p className="text-sm font-medium text-slate-500">Bạn chưa có thông báo nào</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => openNotification(item)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                        item.readAt ? '' : 'bg-emerald-50/50'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.readAt ? 'bg-transparent' : 'bg-emerald-500'}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-sm text-slate-900 ${item.readAt ? 'font-medium' : 'font-bold'}`}
                        >
                          {item.title}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-slate-600">
                          {item.body}
                        </span>
                        <span className="mt-1 block text-[11px] font-medium text-slate-400">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
