import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import BranchList from './branch-list'

const useSearch = vi.fn()
vi.mock('@/hooks/use-public-branches', () => ({
  usePublicBranchSearch: (...args: unknown[]) => useSearch(...args),
}))

const branch = {
  id: 7, name: 'Cau long Thanh Xuan', address: '1 Nguyen Trai', city: 'Ha Noi', district: 'Thanh Xuan',
  latitude: null, longitude: null, minPrice: 100000, maxPrice: 150000, courtCount: 4, distanceKm: null,
  averageRating: 4.5, reviewCount: 3,
}

function renderList(url = '/branches') {
  return render(<MemoryRouter initialEntries={[url]}><BranchList /></MemoryRouter>)
}

describe('BranchList', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks() })

  it('passes the URL filters to the search hook', () => {
    useSearch.mockReturnValue({ data: undefined, isPending: true, isFetching: true, error: null })
    renderList('/branches?city=Ha%20Noi&courtTypeId=2&page=1')
    expect(useSearch).toHaveBeenCalledWith(expect.objectContaining({ city: 'Ha Noi', courtTypeId: 2, page: 1, size: 6 }))
  })

  it('renders branch cards with court count, rating and price', () => {
    useSearch.mockReturnValue({ data: { content: [branch], page: 0, size: 6, totalElements: 1, totalPages: 1 }, isPending: false, isFetching: false, error: null })
    renderList()
    expect(screen.getByText('Cau long Thanh Xuan')).toBeTruthy()
    expect(screen.getByText('4 sân')).toBeTruthy()
    expect(screen.getByText('4.5 ★ (3)')).toBeTruthy()
    expect(screen.getByText(/100\.000.*150\.000/)).toBeTruthy()
  })

  it('shows the empty state', () => {
    useSearch.mockReturnValue({ data: { content: [], page: 0, size: 6, totalElements: 0, totalPages: 0 }, isPending: false, isFetching: false, error: null })
    renderList()
    expect(screen.getByText(/Không tìm thấy cơ sở nào/)).toBeTruthy()
  })
})
