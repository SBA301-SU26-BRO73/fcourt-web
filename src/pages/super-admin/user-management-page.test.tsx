import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getUsers, lockUser, unlockUser } from '@/services/user/user.service'
import type { UserAdminItem } from '@/types/admin'
import { UserManagementPage } from './user-management-page'

vi.mock('@/services/user/user.service', () => ({ getUsers: vi.fn(), lockUser: vi.fn(), unlockUser: vi.fn() }))

const users: UserAdminItem[] = [
  { id: 1, fullName: 'Khách A', email: 'a@example.com', phone: null, role: 'CUSTOMER', status: 'ACTIVE', createdAt: '2030-01-02T00:00:00Z' },
  { id: 2, fullName: 'Chủ sân B', email: 'b@example.com', phone: null, role: 'ADMIN', status: 'LOCKED', createdAt: '2030-01-02T00:00:00Z' },
  { id: 3, fullName: 'Nhân viên C', email: 'c@example.com', phone: null, role: 'STAFF', status: 'PENDING_APPROVAL', createdAt: '2030-01-02T00:00:00Z' },
  { id: 4, fullName: 'Quản trị D', email: 'd@example.com', phone: null, role: 'SUPER_ADMIN', status: 'INACTIVE', createdAt: '2030-01-02T00:00:00Z' },
  { id: 5, fullName: 'Khách E', email: 'e@example.com', phone: null, role: 'CUSTOMER', status: 'REJECTED', createdAt: '2030-01-02T00:00:00Z' },
]
const pageData = { content: users, totalElements: 15, totalPages: 2, size: 10, number: 0 }
let client: QueryClient

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  vi.mocked(getUsers).mockResolvedValue(pageData)
})
afterEach(() => { cleanup(); client.clear(); vi.resetAllMocks() })

function renderPage() {
  return render(<QueryClientProvider client={client}><UserManagementPage /></QueryClientProvider>)
}

describe('UserManagementPage Vietnamese copy', () => {
  it('translates filters, headings, all roles and statuses, empty phone, dates and pagination', async () => {
    renderPage()
    await screen.findByText('Khách A')
    for (const label of ['Tất cả vai trò', 'Khách hàng', 'Chủ sân', 'Nhân viên', 'Tất cả trạng thái',
      'Đang hoạt động', 'Đã khóa', 'Chờ duyệt', 'Ngừng hoạt động', 'Đã từ chối']) {
      expect(screen.getByRole('option', { name: label })).toBeTruthy()
    }
    for (const heading of ['Tài khoản', 'Liên hệ', 'Vai trò', 'Trạng thái', 'Thao tác']) {
      expect(screen.getByRole('columnheader', { name: heading })).toBeTruthy()
    }
    expect(screen.getByRole('heading', { name: 'Người dùng hệ thống' })).toBeTruthy()
    expect(screen.getByText('Quản lý tài khoản')).toBeTruthy()
    expect(screen.getByText('Tổng kết quả')).toBeTruthy()
    expect(screen.getByPlaceholderText('Tìm theo tên, email hoặc số điện thoại')).toBeTruthy()
    expect(screen.getAllByText('Chưa có số điện thoại')).toHaveLength(5)
    expect(screen.getAllByText(`Ngày tạo ${new Date(users[0].createdAt).toLocaleDateString('vi-VN')}`)).toHaveLength(5)
    for (const label of ['Khách hàng', 'Chủ sân', 'Nhân viên', 'Quản trị viên hệ thống',
      'Đang hoạt động', 'Đã khóa', 'Chờ duyệt', 'Ngừng hoạt động', 'Đã từ chối']) {
      expect(screen.getAllByRole('cell', { name: label }).length).toBeGreaterThan(0)
    }
    expect(screen.getByRole('button', { name: 'Sau' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Trước' })).toBeTruthy()
    expect(screen.getByText('Trang 1 / 2')).toBeTruthy()
  })

  it('uses Vietnamese in the lock dialog, pending state and success toast', async () => {
    let finishLock!: (user: UserAdminItem) => void
    vi.mocked(lockUser).mockImplementation(() => new Promise((resolve) => { finishLock = resolve }))
    renderPage()
    const row = (await screen.findByText('Khách A')).closest('tr')!
    fireEvent.click(within(row).getByRole('button', { name: 'Khóa' }))
    expect(screen.getByRole('heading', { name: 'Khóa tài khoản' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Đóng' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeTruthy()
    expect(screen.getByText('Vui lòng nhập lý do')).toBeTruthy()
    const confirm = screen.getByRole('button', { name: 'Xác nhận khóa' }) as HTMLButtonElement
    expect(confirm.disabled).toBe(true)
    const reason = screen.getByRole('textbox', { name: 'Lý do khóa' })
    expect(reason.getAttribute('placeholder')).toBe('Nhập lý do khóa tài khoản này...')
    fireEvent.change(reason, { target: { value: '  Vi phạm nội quy  ' } })
    fireEvent.click(confirm)
    await screen.findByRole('button', { name: 'Đang khóa...' })
    expect(lockUser).toHaveBeenCalledWith(1, 'Vi phạm nội quy')
    await act(async () => finishLock({ ...users[0], status: 'LOCKED' }))
    expect(await screen.findByText('Đã khóa tài khoản')).toBeTruthy()
  })

  it('uses Vietnamese for the unlock action and success toast', async () => {
    vi.mocked(unlockUser).mockResolvedValue({ ...users[1], status: 'ACTIVE' })
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Mở khóa' }))
    expect(await screen.findByText('Đã mở khóa tài khoản')).toBeTruthy()
    expect(unlockUser).toHaveBeenCalledWith(2)
  })

  it('shows Vietnamese while loading and when no accounts match', async () => {
    vi.mocked(getUsers).mockResolvedValue({ ...pageData, content: [], totalElements: 0, totalPages: 0 })
    renderPage()
    expect(screen.getByText('Đang tải tài khoản...')).toBeTruthy()
    expect(await screen.findByText('Không tìm thấy tài khoản phù hợp.')).toBeTruthy()
    expect(screen.getByText('Trang 0 / 0')).toBeTruthy()
  })

  it('shows a Vietnamese load error', async () => {
    vi.mocked(getUsers).mockRejectedValue(new Error('server unavailable'))
    renderPage()
    expect(await screen.findByText('Không thể tải danh sách tài khoản.')).toBeTruthy()
  })
})
