import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getCancellationPolicy } from '@/services/booking/my-booking.api'
import type { MyBooking } from '@/types/my-booking'

import { CustomerCancelDialog } from './CustomerCancelDialog'
import { RefundRequestDialog } from './RefundRequestDialog'
import { ReviewDialog } from './ReviewDialog'

vi.mock('@/services/booking/my-booking.api', () => ({ getCancellationPolicy: vi.fn() }))

const booking = {
  id: 7,
  bookingCode: 'BK-7',
  courtName: 'Sân 1',
  branchName: 'CN Quận 1',
  cancellationReason: null,
} as MyBooking

function wrap(node: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{node}</QueryClientProvider>)
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('CustomerCancelDialog', () => {
  const policy = {
    allowed: true,
    reason: 'Được hủy trước hạn quy định',
    startsAt: null,
    cancelBefore: null,
    cutoffHours: 12,
    refundAmount: 200000,
    refundPercent: 100,
    currency: 'VND',
  }

  it('shows the refund from the policy and confirms with the typed reason', async () => {
    vi.mocked(getCancellationPolicy).mockResolvedValue(policy)
    const onConfirm = vi.fn()
    wrap(<CustomerCancelDialog booking={booking} onClose={vi.fn()} onConfirm={onConfirm} />)
    await screen.findByText('Được hủy trước hạn quy định')
    expect(screen.getByText(/200\.000/)).toBeTruthy()
    const confirm = screen.getByRole('button', { name: /Xác nhận hủy/ }) as HTMLButtonElement
    expect(confirm.disabled).toBe(true)
    fireEvent.change(screen.getByPlaceholderText('Nhập lý do hủy đặt sân'), { target: { value: ' bận việc ' } })
    expect(confirm.disabled).toBe(false)
    fireEvent.click(confirm)
    expect(onConfirm).toHaveBeenCalledWith('bận việc')
  })

  it('blocks cancelling when the policy says no', async () => {
    vi.mocked(getCancellationPolicy).mockResolvedValue({
      ...policy,
      allowed: false,
      reason: 'Đã quá thời hạn hủy',
      refundAmount: 0,
    })
    wrap(<CustomerCancelDialog booking={booking} onClose={vi.fn()} onConfirm={vi.fn()} />)
    await screen.findByText('Đã quá thời hạn hủy')
    fireEvent.change(screen.getByPlaceholderText('Nhập lý do hủy đặt sân'), { target: { value: 'lý do' } })
    await waitFor(() =>
      expect((screen.getByRole('button', { name: /Xác nhận hủy/ }) as HTMLButtonElement).disabled).toBe(true),
    )
  })
})

describe('RefundRequestDialog', () => {
  it('validates before submitting, then sends bank details without an amount', () => {
    const onSubmit = vi.fn()
    render(<RefundRequestDialog booking={booking} amount={150000} onClose={vi.fn()} onSubmit={onSubmit} />)
    fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Vui lòng chọn ngân hàng')).toBeTruthy()

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '970436' } })
    fireEvent.change(screen.getByPlaceholderText('Nhập số tài khoản'), { target: { value: '01234 56789' } })
    fireEvent.change(screen.getByPlaceholderText('NGUYEN VAN A'), { target: { value: 'nguyen van a' } })
    fireEvent.change(screen.getByPlaceholderText('Lý do yêu cầu hoàn tiền'), { target: { value: 'bận' } })
    fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }))
    expect(onSubmit).toHaveBeenCalledWith({
      bookingId: 7,
      bankName: 'Vietcombank',
      bankBin: '970436',
      bankAccountNumber: '0123456789',
      bankAccountName: 'NGUYEN VAN A',
      reason: 'bận',
    })
  })
})

describe('ReviewDialog', () => {
  it('needs a rating, then submits comment and photos', () => {
    const onSubmit = vi.fn()
    render(<ReviewDialog booking={booking} onClose={vi.fn()} onSubmit={onSubmit} />)
    const send = screen.getByRole('button', { name: 'Gửi đánh giá' }) as HTMLButtonElement
    expect(send.disabled).toBe(true)
    fireEvent.click(screen.getByRole('radio', { name: '4 sao' }))
    fireEvent.change(screen.getByPlaceholderText(/Chia sẻ trải nghiệm/), { target: { value: 'ổn' } })
    const photo = new File(['p'], 'a.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('Chọn ảnh đánh giá'), { target: { files: [photo] } })
    fireEvent.click(send)
    expect(onSubmit).toHaveBeenCalledWith({ bookingId: 7, rating: 4, comment: 'ổn', files: [photo] })
  })

  it('refuses a non-image file', () => {
    render(<ReviewDialog booking={booking} onClose={vi.fn()} onSubmit={vi.fn()} />)
    const pdf = new File(['p'], 'a.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText('Chọn ảnh đánh giá'), { target: { files: [pdf] } })
    expect(screen.getByText('Chỉ chấp nhận ảnh JPG, PNG hoặc WebP')).toBeTruthy()
  })
})
