import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { changePassword, getProfile } from '@/services/auth/auth.service'
import { ProfilePage } from './profile-page'

vi.mock('@/services/auth/auth.service', () => ({
  changePassword: vi.fn(), getProfile: vi.fn(), updateProfile: vi.fn(),
}))
vi.mock('@/hooks/use-auth-context', () => ({ useAuth: () => ({
  user: { id: 1, email: 'user@example.com', role: 'CUSTOMER' }, isLoggedIn: true, clearAuth: vi.fn(), logout: vi.fn(),
}) }))
vi.mock('@/hooks/use-admin-dashboard', () => ({ useAdminDashboard: () => ({ data: undefined }) }))
vi.mock('@/utils/token', () => ({ tokenStorage: {
  getAccessToken: () => 'test-token', getRefreshToken: () => null, setUser: vi.fn(),
} }))
vi.mock('./avatar-editor', () => ({ AvatarEditor: () => null }))

beforeEach(() => {
  vi.mocked(getProfile).mockResolvedValue({
    id: 1, email: 'user@example.com', fullName: 'Nguyễn Văn A', phone: '0901234567', role: 'CUSTOMER', status: 'ACTIVE',
  })
  vi.mocked(changePassword).mockResolvedValue(undefined)
})
afterEach(() => { cleanup(); vi.clearAllMocks() })

describe('ProfilePage password minimum', () => {
  it.each(['123456', '1234567'])('rejects a %s new password before calling the API', async (password) => {
    await fillPasswordForm(password)
    fireEvent.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }))
    expect(screen.getByText('Mật khẩu tối thiểu 8 ký tự')).toBeTruthy()
    expect(changePassword).not.toHaveBeenCalled()
  })

  it('accepts exactly eight characters', async () => {
    await fillPasswordForm('12345678')
    fireEvent.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }))
    await waitFor(() => expect(screen.getByText('Đổi mật khẩu thành công!')).toBeTruthy())
    expect(changePassword).toHaveBeenCalledWith({ currentPassword: 'old-password', newPassword: '12345678' })
  })
})

async function fillPasswordForm(password: string) {
  render(<QueryClientProvider client={new QueryClient()}><MemoryRouter><ProfilePage /></MemoryRouter></QueryClientProvider>)
  await screen.findAllByText('Nguyễn Văn A')
  fireEvent.click(screen.getByRole('button', { name: 'Đổi mật khẩu' }))
  for (const [placeholder, value] of [
    ['Nhập mật khẩu hiện tại', 'old-password'], ['Tối thiểu 8 ký tự', password], ['Nhập lại mật khẩu mới', password],
  ]) {
    fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } })
  }
}
