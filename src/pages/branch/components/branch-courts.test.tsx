import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import BranchCourts from './branch-courts'

vi.mock('@/hooks/use-public-branches', () => ({
  usePublicCourtSlots: () => ({ data: [], isPending: false, isError: false }),
}))

const court = { id: 1, name: 'Sân 1', courtTypeId: 1, defaultPricePerHour: 100000, courtTypeName: 'Cầu lông' }

describe('BranchCourts', () => {
  afterEach(cleanup)

  it('shows the court photo and falls back to the sport image without one', () => {
    render(
      <MemoryRouter>
        <BranchCourts branchId={1} isLoading={false} courts={[{ ...court, imageUrl: 'https://cdn.example/court.jpg' }, { ...court, id: 2, name: 'Sân 2', imageUrl: null }]} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('img', { name: 'Sân 1' }).getAttribute('src')).toBe('https://cdn.example/court.jpg')
    expect(screen.getByRole('img', { name: 'Sân 2' }).getAttribute('src')).toContain('googleusercontent')
  })
})
