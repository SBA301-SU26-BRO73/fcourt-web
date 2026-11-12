import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import BranchBookingPanel from '@/pages/branch/components/booking-panel'
import SlotBookingPage from '@/pages/slot-booking/slot-booking-page'
import DetailedBranchCard from '@/components/ui/detailed-branch-card'
import type { PublicBranchDetail } from '@/types/public-branch'

const { useAuth, useSlots } = vi.hoisted(() => ({ useAuth: vi.fn(), useSlots: vi.fn() }))
vi.mock('@/hooks/use-auth-context', () => ({ useAuth }))
vi.mock('@/hooks/use-public-branches', () => ({ usePublicCourtSlots: useSlots }))
afterEach(() => { cleanup(); vi.clearAllMocks() })

describe('ADMIN on customer booking pages', () => {
  it('replaces desktop and mobile booking entries with staff instructions', () => {
    useAuth.mockReturnValue({ user: { role: 'ADMIN' } })
    render(<MemoryRouter><BranchBookingPanel branch={{ id: 7 } as PublicBranchDetail} courts={[]} /></MemoryRouter>)
    expect(screen.queryByRole('button', { name: /Đặt sân/ })).toBeNull()
    expect(screen.getByText(/tài khoản STAFF tại Quầy/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Quản lý nhân viên' }).getAttribute('href')).toBe('/admin/staff')
    expect(useSlots).not.toHaveBeenCalled()
  })

  it('blocks direct slot-booking access before creating any hold', () => {
    useAuth.mockReturnValue({ user: { role: 'ADMIN' } })
    render(<MemoryRouter><SlotBookingPage /></MemoryRouter>)
    expect(screen.getByText(/Đặt sân vãng lai/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Giữ chỗ|thanh toán/ })).toBeNull()
  })

  it.each(['ADMIN', 'CUSTOMER', null])('uses the branch card entry appropriate for %s', (role) => {
    useAuth.mockReturnValue({ user: role ? { role } : null })
    render(<MemoryRouter><DetailedBranchCard id="7" title="CN" address="HN" courtTypes={[]} tags={[]} /></MemoryRouter>)
    expect(screen.getByRole('button', { name: role === 'ADMIN' ? 'Xem chi tiết sân' : 'Đặt sân ngay' })).toBeTruthy()
  })
})
