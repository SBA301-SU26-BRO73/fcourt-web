import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ConfirmModal } from './ConfirmModal'

afterEach(cleanup)

describe('ConfirmModal', () => {
  it('needs a reason before rejecting a bill and passes it on', () => {
    const onConfirm = vi.fn()
    render(<ConfirmModal open action="reject_payment" bookingCode="BK-1" loading={false} onConfirm={onConfirm} onCancel={vi.fn()} />)
    const confirm = screen.getByRole('button', { name: 'Từ chối bill' })
    expect((confirm as HTMLButtonElement).disabled).toBe(true)

    fireEvent.change(screen.getByLabelText(/Lý do/), { target: { value: '  Sai số tiền ' } })
    fireEvent.click(confirm)
    expect(onConfirm).toHaveBeenCalledWith('Sai số tiền')
  })

  it('confirms a payment without asking for a reason', () => {
    const onConfirm = vi.fn()
    render(<ConfirmModal open action="approve" bookingCode="BK-1" loading={false} onConfirm={onConfirm} onCancel={vi.fn()} />)
    expect(screen.queryByLabelText(/Lý do/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }))
    expect(onConfirm).toHaveBeenCalledWith('')
  })
})
