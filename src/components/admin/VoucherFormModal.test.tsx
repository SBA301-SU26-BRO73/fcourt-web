import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createVoucher, updateVoucher } from '@/services/voucher/voucher.api'
import type { Voucher } from '@/types/voucher'

import VoucherFormModal from './VoucherFormModal'

vi.mock('@/services/voucher/voucher.api', () => ({ createVoucher: vi.fn(), updateVoucher: vi.fn() }))

const branches = [{ id: 3, name: 'Cơ sở A' }]

const voucher: Voucher = {
  id: 9,
  code: 'KM50K',
  branchId: 3,
  discountType: 'FIXED_AMOUNT',
  discountValue: 50000,
  maxDiscountAmount: null,
  minOrderAmount: 0,
  startDate: '2026-11-01T00:00:00Z',
  endDate: '2026-12-01T00:00:00Z',
  usageLimit: 10,
  usedCount: 2,
  status: 'ACTIVE',
}

function renderModal(props: { voucher: Voucher | null; onSuccess?: () => void; onClose?: () => void }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <VoucherFormModal
        isOpen
        voucher={props.voucher}
        branches={branches}
        onClose={props.onClose ?? vi.fn()}
        onSuccess={props.onSuccess ?? vi.fn()}
      />
    </QueryClientProvider>,
  )
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('VoucherFormModal', () => {
  it('blocks an empty create and does not call the API', () => {
    renderModal({ voucher: null })
    fireEvent.click(screen.getByRole('button', { name: 'Thêm mới' }))
    expect(screen.getByText('Vui lòng nhập mã giảm giá.')).toBeTruthy()
    expect(createVoucher).not.toHaveBeenCalled()
  })

  it('creates a voucher with the new contract', async () => {
    vi.mocked(createVoucher).mockResolvedValue(voucher)
    const onSuccess = vi.fn()
    const { container } = renderModal({ voucher: null, onSuccess })
    fireEvent.change(screen.getByPlaceholderText('Ví dụ: SUMMER20, KM50K'), { target: { value: 'tet25' } })
    fireEvent.change(screen.getByPlaceholderText('Ví dụ: 15'), { target: { value: '15' } })
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('Tạo mã giảm giá thành công.'))
    expect(createVoucher).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'TET25', branchId: 3, discountType: 'PERCENTAGE', discountValue: 15, status: 'ACTIVE' }),
    )
  })

  it('edits with a PUT that can switch the voucher off', async () => {
    vi.mocked(updateVoucher).mockResolvedValue({ ...voucher, status: 'EXPIRED' })
    const onSuccess = vi.fn()
    renderModal({ voucher, onSuccess })
    fireEvent.click(screen.getByLabelText(/Kích hoạt hoạt động/))
    fireEvent.click(screen.getByRole('button', { name: 'Cập nhật' }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('Cập nhật mã giảm giá thành công.'))
    expect(updateVoucher).toHaveBeenCalledWith(
      9,
      expect.objectContaining({ code: 'KM50K', branchId: 3, discountType: 'FIXED_AMOUNT', discountValue: 50000, status: 'EXPIRED' }),
    )
  })

  it('shows the server message when the code already exists', async () => {
    vi.mocked(createVoucher).mockRejectedValue(new Error('Voucher code already exists'))
    const { container } = renderModal({ voucher: null })
    fireEvent.change(screen.getByPlaceholderText('Ví dụ: SUMMER20, KM50K'), { target: { value: 'DUP' } })
    fireEvent.change(screen.getByPlaceholderText('Ví dụ: 15'), { target: { value: '10' } })
    fireEvent.submit(container.querySelector('form')!)
    expect(await screen.findByText('Voucher code already exists')).toBeTruthy()
  })
})
