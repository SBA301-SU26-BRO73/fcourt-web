import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'

import BookingPanel from './booking-panel'

vi.mock('@/hooks/use-auth-context', () => ({ useAuth: () => ({ user: null }) }))
vi.mock('@/hooks/use-public-branches', () => ({
  usePublicCourtSlots: () => ({ data: [], isFetching: false, error: null }),
}))

afterEach(cleanup)

it('shows the backend cancellation cutoff of 12 hours', () => {
  render(<MemoryRouter><BookingPanel
    branch={{ id: 1, name: 'Chi nhánh A', address: 'Đường A', city: 'Hà Nội', status: 'ACTIVE' }}
    courts={[]}
  /></MemoryRouter>)
  expect(screen.getByText('Có thể hủy trước tối thiểu 12 giờ')).toBeTruthy()
  expect(screen.queryByText('Có thể hủy trước tối thiểu 1 giờ')).toBeNull()
})
