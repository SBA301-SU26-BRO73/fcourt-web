import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import BranchInfo from './branch-info'

const courts = [{ id: 1, name: 'Sân 1', courtTypeId: 1, defaultPricePerHour: 100000, courtTypeName: 'Cầu lông' }]

describe('BranchInfo', () => {
  afterEach(cleanup)

  it('shows opening hours and the phone number', () => {
    render(<BranchInfo branch={{ id: 1, name: 'CN', address: 'a', city: 'c', status: 'ACTIVE', phone: '0901234567', openTime: '06:00', closeTime: '22:30' }} courts={courts} />)
    expect(screen.getByText('Giờ hoạt động')).toBeTruthy()
    expect(screen.getByText(/06:00 – 22:30/)).toBeTruthy()
    expect(screen.getByRole('link', { name: '0901234567' }).getAttribute('href')).toBe('tel:0901234567')
  })

  it('hides both rows when the backend sends neither', () => {
    render(<BranchInfo branch={{ id: 1, name: 'CN', address: 'a', city: 'c', status: 'ACTIVE' }} courts={courts} />)
    expect(screen.queryByText('Giờ hoạt động')).toBeNull()
    expect(screen.queryByText('Số điện thoại')).toBeNull()
  })
})
