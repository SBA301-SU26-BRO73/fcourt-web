import { StrictMode } from 'react'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createBooking } from '@/services/booking/booking.api'
import { saveActiveHold } from '@/utils/hold-storage'

import { PaymentPage } from './PaymentPage'

vi.mock('@/services/booking/booking.api', () => ({
  createBooking: vi.fn(),
  newIdempotencyKey: () => 'key-1',
}))
vi.mock('@/hooks/use-auth-context', () => ({ useAuth: () => ({ user: { role: 'CUSTOMER' } }) }))

function Where() {
  const loc = useLocation()
  return <div data-testid="where">{loc.pathname + loc.search}</div>
}

describe('PaymentPage HoldCheckout under StrictMode', () => {
  afterEach(() => {
    cleanup()
    sessionStorage.clear()
  })

  it('navigates to the booking after the create call resolves', async () => {
    saveActiveHold({
      holdToken: 'tok',
      expiresAt: Date.now() + 600_000,
      courtId: 1,
      courtName: 'Court 1',
      branchId: 1,
      branchName: 'Branch',
      date: '2026-12-01',
      guestPhone: '',
      slots: [{ slotId: 5, startTime: '08:00', endTime: '09:00', price: 100000 }],
    })
    vi.mocked(createBooking).mockResolvedValue({ id: 42 } as never)

    render(
      <StrictMode>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter initialEntries={['/payment']}>
            <Where />
            <Routes>
              <Route path="/payment" element={<PaymentPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </StrictMode>,
    )

    await waitFor(() => expect(screen.getByTestId('where').textContent).toBe('/payment?bookingId=42'))
    expect(createBooking).toHaveBeenCalledTimes(1)
  })
})
