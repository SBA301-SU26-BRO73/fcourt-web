import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AdminRefund } from '@/types/admin-booking'
import { AdminRefundRequestsPage } from './AdminRefundRequestsPage'

const { approve, complete, usePending } = vi.hoisted(() => ({ approve: vi.fn(), complete: vi.fn(), usePending: vi.fn() }))
vi.mock('@/hooks/use-branch-choice', () => ({ useBranchChoice: () => ({ branches: [], branchId: 7, setBranchId: vi.fn() }) }))
vi.mock('@/hooks/use-admin-bookings', () => ({
  usePendingRefunds: usePending,
  useApproveRefund: () => ({ mutate: approve, isPending: false }),
  useCompleteRefund: () => ({ mutate: complete, isPending: false }),
  useRejectRefund: () => ({ mutate: vi.fn(), isPending: false }),
}))
const refund: AdminRefund = {
  id: 25, bookingId: 42, amount: 100000, status: 'PENDING', bankName: null, bankBin: null,
  bankAccountName: null, bankAccountNumber: null, bankInfoMissing: true, customerPhone: '0912345678',
  reason: null, adminNote: null, transferProofUrl: null, createdAt: '2026-11-12T01:00:00Z', updatedAt: '2026-11-12T01:00:00Z',
}
afterEach(() => { cleanup(); vi.clearAllMocks() })

describe('owner missing bank refund controls', () => {
  it('shows the missing-bank badge and phone and blocks approval', () => {
    usePending.mockReturnValue({ data: [refund] })
    render(<AdminRefundRequestsPage />)
    expect(screen.getByText('Chưa có thông tin ngân hàng')).toBeTruthy()
    expect(screen.getByText(/0912345678/)).toBeTruthy()
    const button = screen.getByRole('button', { name: 'Duyệt yêu cầu' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    fireEvent.click(button)
    expect(approve).not.toHaveBeenCalled()
    expect((screen.getByRole('button', { name: 'Từ chối' }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('blocks completion even after a proof image is selected', () => {
    usePending.mockReturnValue({ data: [{ ...refund, status: 'APPROVED' }] })
    const { container } = render(<AdminRefundRequestsPage />)
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [new File(['x'], 'proof.png', { type: 'image/png' })] } })
    const button = screen.getByRole('button', { name: 'Đã chuyển khoản' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    fireEvent.click(button)
    expect(complete).not.toHaveBeenCalled()
  })

  it('allows approval when banks are present without an optional BIN', () => {
    usePending.mockReturnValue({ data: [{ ...refund, bankInfoMissing: false, bankName: 'VCB', bankAccountName: 'A', bankAccountNumber: '123456' }] })
    render(<AdminRefundRequestsPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Duyệt yêu cầu' }))
    expect(approve).toHaveBeenCalledWith(25, expect.any(Object))
  })
})
