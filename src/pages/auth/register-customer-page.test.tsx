import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RegisterCustomerPage } from './register-customer-page'

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }))
vi.mock('@/hooks/use-auth', () => ({
  useRegisterCustomer: () => ({ mutate, isPending: false, error: null }),
}))
vi.mock('@/components/auth/hero-panel', () => ({ HeroPanel: () => null }))

afterEach(() => { cleanup(); vi.clearAllMocks() })

describe('RegisterCustomerPage password minimum', () => {
  it.each(['123456', '1234567'])('rejects a %s password before registration', (password) => {
    fillForm(password)
    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))
    expect(screen.getByText('Mật khẩu tối thiểu 8 ký tự')).toBeTruthy()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('accepts exactly eight characters', () => {
    fillForm('12345678')
    fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))
    expect(screen.queryByText('Mật khẩu tối thiểu 8 ký tự')).toBeNull()
    expect(mutate).toHaveBeenCalledWith({
      fullName: 'Nguyễn Văn A', phone: '0901234567', email: 'user@example.com', password: '12345678',
    })
  })
})

function fillForm(password: string) {
  render(<MemoryRouter><RegisterCustomerPage /></MemoryRouter>)
  for (const [placeholder, value] of [
    ['Nguyễn Văn A', 'Nguyễn Văn A'], ['0901 234 567', '0901234567'], ['you@example.com', 'user@example.com'],
    ['Tối thiểu 8 ký tự', password], ['Nhập lại mật khẩu', password],
  ]) {
    fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } })
  }
  fireEvent.click(screen.getByRole('checkbox'))
}
