import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/common/utils/api-error'
import { applyVoucher } from '@/services/voucher/voucher.api'
import type { MyBooking } from '@/types/my-booking'

import { VoucherApplyBox } from './VoucherApplyBox'

vi.mock('@/services/voucher/voucher.api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/voucher/voucher.api')>()),
  applyVoucher: vi.fn(),
}))

const booking = { id: 9, totalPrice: 100000, originalAmount: 100000, discountAmount: null, voucherApplicationId: null } as MyBooking

function renderBox(b: MyBooking) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <VoucherApplyBox booking={b} />
    </QueryClientProvider>,
  )
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('VoucherApplyBox', () => {
  it('applies the code against the booking gross amount', async () => {
    vi.mocked(applyVoucher).mockResolvedValue({} as never)
    renderBox(booking)
    fireEvent.change(screen.getByLabelText('Mã giảm giá'), { target: { value: 'sale10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng' }))
    await waitFor(() => expect(applyVoucher).toHaveBeenCalledWith({ code: 'sale10', bookingId: 9, totalAmount: 100000 }))
  })

  it('shows the server message when the code is rejected', async () => {
    vi.mocked(applyVoucher).mockRejectedValue(new ApiError({ status: 400, message: 'Mã khuyến mãi đã hết hạn' }))
    renderBox(booking)
    fireEvent.change(screen.getByLabelText('Mã giảm giá'), { target: { value: 'OLD' } })
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng' }))
    expect((await screen.findByRole('alert')).textContent).toContain('hết hạn')
  })

  it('shows the applied state with the discount', () => {
    renderBox({ ...booking, voucherApplicationId: 'u', discountAmount: 20000 })
    expect(screen.getByText(/Đã áp dụng mã giảm giá/)).toBeTruthy()
    expect(screen.queryByLabelText('Mã giảm giá')).toBeNull()
  })
})
