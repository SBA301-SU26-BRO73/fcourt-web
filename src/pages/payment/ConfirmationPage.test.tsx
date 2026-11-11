import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuth } from '@/hooks/use-auth-context'
import { useBookingDetail, usePaymentStatus } from '@/hooks/use-customer-checkout'
import { saveGuestBookingToken } from '@/utils/guest-booking-storage'
import { ConfirmationPage } from './ConfirmationPage'

vi.mock('@/hooks/use-auth-context', () => ({ useAuth: vi.fn() }))
vi.mock('@/hooks/use-customer-checkout', () => ({ useBookingDetail: vi.fn(), usePaymentStatus: vi.fn() }))

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ user: null } as ReturnType<typeof useAuth>)
  vi.mocked(useBookingDetail).mockReturnValue({} as ReturnType<typeof useBookingDetail>)
  vi.mocked(usePaymentStatus).mockReturnValue({} as ReturnType<typeof usePaymentStatus>)
})

afterEach(() => {
  cleanup()
  sessionStorage.clear()
  vi.clearAllMocks()
})

function openConfirmation() {
  render(
    <MemoryRouter initialEntries={['/confirmation?bookingId=42']}>
      <Routes>
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/lookup" element={<div>Lookup page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('confirmation access', () => {
  it('offers guest lookup without starting protected requests in a fresh tab', () => {
    openConfirmation()
    expect(screen.getByText('Bạn đặt sân không cần đăng nhập?')).toBeTruthy()
    expect(screen.getByText('Tra cứu đơn bằng mã đặt sân và số điện thoại.')).toBeTruthy()
    expect(useBookingDetail).not.toHaveBeenCalled()
    expect(usePaymentStatus).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Tra cứu đơn' }))
    expect(screen.getByText('Lookup page')).toBeTruthy()
  })

  it('continues loading confirmation for a signed-in customer', () => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 1, role: 'CUSTOMER', email: 'a@example.com' } } as ReturnType<typeof useAuth>)
    openConfirmation()
    expect(useBookingDetail).toHaveBeenCalledWith(42, expect.objectContaining({ holdToken: null }))
    expect(usePaymentStatus).toHaveBeenCalledWith(42, expect.objectContaining({ holdToken: null }))
    expect(screen.getByText('Đang tải trạng thái thanh toán...')).toBeTruthy()
  })

  it('continues using the stored credential for a guest booking', () => {
    saveGuestBookingToken(42, 'guest-token')
    openConfirmation()
    expect(useBookingDetail).toHaveBeenCalledWith(42, expect.objectContaining({ holdToken: 'guest-token' }))
    expect(usePaymentStatus).toHaveBeenCalledWith(42, expect.objectContaining({ holdToken: 'guest-token' }))
  })
})
