import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import BookingPanel, { type SelectedSlot } from './booking-panel'

const slots: SelectedSlot[] = [
  { slotId: 1, courtId: 1, courtName: 'Sân 1', startTime: '06:00', endTime: '06:30', price: 50000, date: '2030-01-01' },
  { slotId: 2, courtId: 1, courtName: 'Sân 1', startTime: '06:30', endTime: '07:00', price: 60000, date: '2030-01-01' },
]

afterEach(cleanup)

describe('BookingPanel', () => {
  it('renders nothing without a selection', () => {
    const { container } = render(<BookingPanel selectedSlots={[]} venueName="CN" onBook={vi.fn()} />)
    expect(container.innerHTML).toBe('')
  })

  it('shows no phone field to a signed-in customer and books without one', () => {
    const onBook = vi.fn()
    render(<BookingPanel selectedSlots={slots} venueName="CN" onBook={onBook} requiresPhone={false} />)
    expect(screen.queryByLabelText('Số điện thoại liên hệ')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Giữ chỗ khung giờ đã chọn/ }))
    expect(onBook).toHaveBeenCalledWith('')
  })

  it('shows an inline error and does not book when a guest leaves the phone empty', () => {
    const onBook = vi.fn()
    render(<BookingPanel selectedSlots={slots} venueName="CN" onBook={onBook} />)
    fireEvent.click(screen.getByRole('button', { name: /Giữ chỗ/ }))
    expect(screen.getByRole('alert').textContent).toMatch(/Vui lòng nhập số điện thoại/)
    expect(screen.getByLabelText('Số điện thoại liên hệ').getAttribute('aria-invalid')).toBe('true')
    expect(onBook).not.toHaveBeenCalled()
  })

  it('rejects a malformed phone before calling onBook', () => {
    const onBook = vi.fn()
    render(<BookingPanel selectedSlots={slots} venueName="CN" onBook={onBook} />)
    fireEvent.change(screen.getByLabelText('Số điện thoại liên hệ'), { target: { value: '12345' } })
    fireEvent.click(screen.getByRole('button', { name: /Giữ chỗ/ }))
    expect(screen.getByRole('alert').textContent).toMatch(/không hợp lệ/)
    expect(onBook).not.toHaveBeenCalled()
  })

  it('lets a guest type the phone', () => {
    const onBook = vi.fn()
    render(<BookingPanel selectedSlots={slots} venueName="CN" onBook={onBook} />)
    fireEvent.change(screen.getByLabelText('Số điện thoại liên hệ'), { target: { value: '0987654321' } })
    fireEvent.click(screen.getByRole('button', { name: /Giữ chỗ/ }))
    expect(onBook).toHaveBeenCalledWith('0987654321')
  })

  it('shows the countdown with release and continue once the slots are held', () => {
    const onRelease = vi.fn()
    const onContinue = vi.fn()
    const onBook = vi.fn()
    render(
      <BookingPanel
        selectedSlots={slots}
        venueName="CN"
        onBook={onBook}
        hold={{ countdown: '04:32', isWarning: false, onRelease, onContinue }}
      />,
    )
    expect(screen.getByRole('timer').textContent).toContain('04:32')
    expect(screen.queryByLabelText('Số điện thoại liên hệ')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Hủy giữ chỗ' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục thanh toán' }))
    expect(onRelease).toHaveBeenCalledOnce()
    expect(onContinue).toHaveBeenCalledOnce()
    expect(onBook).not.toHaveBeenCalled()
  })

  it('flags the last minute and shows an error', () => {
    render(
      <BookingPanel
        selectedSlots={slots}
        venueName="CN"
        onBook={vi.fn()}
        error="Có khung giờ vừa được người khác giữ"
        hold={{ countdown: '00:42', isWarning: true, onRelease: vi.fn(), onContinue: vi.fn() }}
      />,
    )
    expect(screen.getByText('00:42').className).toContain('text-destructive')
    expect(screen.getByText(/vừa được người khác giữ/)).toBeTruthy()
  })
})
