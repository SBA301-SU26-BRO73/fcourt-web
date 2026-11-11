import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notification/notification.api'
import type { AppNotification, NotificationPage } from '@/types/notification'

import { NotificationBell } from './NotificationBell'

vi.mock('@/hooks/use-auth-context', () => ({ useAuth: () => ({ isLoggedIn: true }) }))
vi.mock('@/services/notification/notification.api', () => ({
  getMyNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}))

const NOW = Date.now()

function notification(overrides: Partial<AppNotification>): AppNotification {
  return {
    id: 1,
    type: 'BOOKING_CONFIRMED',
    title: 'Đặt sân thành công',
    body: 'Đơn đặt sân BK-0042 đã được xác nhận.',
    link: '/my-bookings',
    readAt: null,
    createdAt: new Date(NOW - 5 * 60_000).toISOString(),
    ...overrides,
  }
}

function page(items: AppNotification[]): NotificationPage {
  return { items, page: 0, size: 10, total: items.length }
}

function Where() {
  return <div data-testid="where">{useLocation().pathname}</div>
}

function renderBell() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/home']}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <NotificationBell />
                <Where />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.mocked(getUnreadNotificationCount).mockResolvedValue(0)
  vi.mocked(getMyNotifications).mockResolvedValue(page([]))
  vi.mocked(markNotificationRead).mockResolvedValue(undefined)
  vi.mocked(markAllNotificationsRead).mockResolvedValue(0)
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('NotificationBell', () => {
  it('shows the unread count as a badge, 99+ above 99, nothing at zero', async () => {
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(3)
    renderBell()
    expect((await screen.findByTestId('notification-badge')).textContent).toBe('3')
    expect(screen.getByRole('button', { name: 'Thông báo, 3 chưa đọc' })).toBeTruthy()
    cleanup()

    vi.mocked(getUnreadNotificationCount).mockResolvedValue(250)
    renderBell()
    expect((await screen.findByTestId('notification-badge')).textContent).toBe('99+')
    cleanup()

    vi.mocked(getUnreadNotificationCount).mockResolvedValue(0)
    renderBell()
    await waitFor(() => expect(getUnreadNotificationCount).toHaveBeenCalled())
    expect(screen.queryByTestId('notification-badge')).toBeNull()
  })

  it('polls the unread count every 30 seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    renderBell()
    await waitFor(() => expect(getUnreadNotificationCount).toHaveBeenCalledTimes(1))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000)
    })
    await waitFor(() => expect(getUnreadNotificationCount).toHaveBeenCalledTimes(2))
  })

  it('asks again when the window gets focus back', async () => {
    renderBell()
    await waitFor(() => expect(getUnreadNotificationCount).toHaveBeenCalledTimes(1))

    await act(async () => {
      window.dispatchEvent(new Event('visibilitychange'))
    })
    await waitFor(() => expect(getUnreadNotificationCount).toHaveBeenCalledTimes(2))
  })

  it('lists the latest notifications with relative time and read state', async () => {
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(1)
    vi.mocked(getMyNotifications).mockResolvedValue(
      page([
        notification({ id: 2 }),
        notification({ id: 1, title: 'Đã hoàn tiền', readAt: new Date(NOW).toISOString(), createdAt: new Date(NOW - 3 * 3600_000).toISOString() }),
      ]),
    )
    renderBell()
    fireEvent.click(await screen.findByRole('button', { name: /Thông báo/ }))

    expect(await screen.findByText('Đặt sân thành công')).toBeTruthy()
    expect(screen.getByText('5 phút trước')).toBeTruthy()
    expect(screen.getByText('3 giờ trước')).toBeTruthy()
    expect(getMyNotifications).toHaveBeenCalledWith(0, 10)
  })

  it('marks the notification read and opens its link when clicked', async () => {
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(1)
    vi.mocked(getMyNotifications).mockResolvedValue(page([notification({ id: 7, link: '/admin/bookings' })]))
    renderBell()
    fireEvent.click(await screen.findByRole('button', { name: /Thông báo/ }))
    fireEvent.click(await screen.findByText('Đặt sân thành công'))

    await waitFor(() => expect(markNotificationRead).toHaveBeenCalledWith(7))
    expect(screen.getByTestId('where').textContent).toBe('/admin/bookings')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('does not mark an already read notification again but still navigates', async () => {
    vi.mocked(getMyNotifications).mockResolvedValue(
      page([notification({ id: 8, readAt: new Date(NOW).toISOString() })]),
    )
    renderBell()
    fireEvent.click(await screen.findByRole('button', { name: 'Thông báo' }))
    fireEvent.click(await screen.findByText('Đặt sân thành công'))

    expect(markNotificationRead).not.toHaveBeenCalled()
    expect(screen.getByTestId('where').textContent).toBe('/my-bookings')
  })

  it('marks everything read from the dropdown', async () => {
    vi.mocked(getUnreadNotificationCount).mockResolvedValue(2)
    vi.mocked(getMyNotifications).mockResolvedValue(page([notification({ id: 1 }), notification({ id: 2 })]))
    renderBell()
    fireEvent.click(await screen.findByRole('button', { name: /Thông báo/ }))
    const markAll = await screen.findByRole('button', { name: 'Đánh dấu đã đọc tất cả' })
    await waitFor(() => expect((markAll as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(markAll)

    await waitFor(() => expect(markAllNotificationsRead).toHaveBeenCalledTimes(1))
  })

  it('shows an empty state when there are no notifications', async () => {
    renderBell()
    fireEvent.click(await screen.findByRole('button', { name: 'Thông báo' }))

    expect(await screen.findByText('Bạn chưa có thông báo nào')).toBeTruthy()
    const markAll = screen.getByRole('button', { name: 'Đánh dấu đã đọc tất cả' }) as HTMLButtonElement
    expect(markAll.disabled).toBe(true)
  })

  it('shows an error line when the list cannot be loaded', async () => {
    vi.mocked(getMyNotifications).mockRejectedValue(new Error('boom'))
    renderBell()
    fireEvent.click(await screen.findByRole('button', { name: 'Thông báo' }))

    expect(await screen.findByText('Không tải được thông báo. Vui lòng thử lại.')).toBeTruthy()
  })

  it('closes with Escape', async () => {
    renderBell()
    fireEvent.click(await screen.findByRole('button', { name: 'Thông báo' }))
    expect(await screen.findByRole('dialog')).toBeTruthy()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
