import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { UsageMeter } from './UsageMeter'

afterEach(cleanup)

describe('UsageMeter', () => {
  it('shows used vs max with a progress bar', () => {
    render(<UsageMeter icon={null} label="Chi nhánh" used={2} max={5} />)
    expect(screen.getByText('Đã dùng 2 / tối đa 5')).toBeTruthy()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('2')
    expect(screen.queryByText(/giới hạn/)).toBeNull()
  })

  it('warns near the limit and flags the limit reached', () => {
    const { rerender } = render(<UsageMeter icon={null} label="Sân đấu" used={4} max={5} />)
    expect(screen.getByText('Sắp đạt giới hạn')).toBeTruthy()
    rerender(<UsageMeter icon={null} label="Sân đấu" used={5} max={5} />)
    expect(screen.getByText('Đã đạt giới hạn')).toBeTruthy()
  })

  it('falls back to the plain limit when usage is missing', () => {
    const { rerender } = render(<UsageMeter icon={null} label="Chi nhánh" used={null} max={3} />)
    expect(screen.getByText('Tối đa 3')).toBeTruthy()
    expect(screen.queryByRole('progressbar')).toBeNull()
    rerender(<UsageMeter icon={null} label="Chi nhánh" max={3} />)
    expect(screen.getByText('Tối đa 3')).toBeTruthy()
  })

  it('shows no bar for unlimited plans', () => {
    render(<UsageMeter icon={null} label="Chi nhánh" used={7} max={99} />)
    expect(screen.getByText('Đã dùng 7 / tối đa ∞')).toBeTruthy()
    expect(screen.queryByRole('progressbar')).toBeNull()
  })
})
