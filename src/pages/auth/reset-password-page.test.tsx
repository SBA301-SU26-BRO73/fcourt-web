import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { resetPassword } from '@/services/auth/auth.service'

import { ResetPasswordPage } from './reset-password-page'

vi.mock('@/services/auth/auth.service', () => ({
  resetPassword: vi.fn(),
  forgotPassword: vi.fn(),
  googleLogin: vi.fn(),
  login: vi.fn(),
  registerCourtOwner: vi.fn(),
  registerCustomer: vi.fn(),
}))
vi.mock('@/hooks/use-auth-context', () => ({ useAuth: () => ({ setAuth: vi.fn() }) }))

function renderPage(url: string) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[url]}>
        <ResetPasswordPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ResetPasswordPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('asks for a new link when the token is missing', () => {
    renderPage('/reset-password')
    expect(screen.getByText('Link không hợp lệ')).toBeTruthy()
  })

  it('validates, submits the token with the new password and shows success', async () => {
    vi.mocked(resetPassword).mockResolvedValue(undefined)
    renderPage('/reset-password?token=abc')
    const password = screen.getByPlaceholderText('Tối thiểu 8 ký tự')
    const confirm = screen.getByPlaceholderText('Nhập lại mật khẩu mới')

    fireEvent.change(password, { target: { value: 'short' } })
    fireEvent.change(confirm, { target: { value: 'short' } })
    fireEvent.click(screen.getByRole('button', { name: 'Đặt lại mật khẩu' }))
    expect(screen.getByText(/tối thiểu 8/)).toBeTruthy()
    expect(resetPassword).not.toHaveBeenCalled()

    fireEvent.change(password, { target: { value: 'newpassword1' } })
    fireEvent.change(confirm, { target: { value: 'newpassword1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Đặt lại mật khẩu' }))
    await waitFor(() => expect(screen.getByText('Đã đặt lại mật khẩu')).toBeTruthy())
    expect(resetPassword).toHaveBeenCalledWith('abc', 'newpassword1')
  })
})
