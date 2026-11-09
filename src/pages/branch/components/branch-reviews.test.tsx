import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import BranchReviews from './branch-reviews'

const useReviews = vi.fn()
vi.mock('@/hooks/use-public-branches', () => ({
  usePublicBranchReviews: (...args: unknown[]) => useReviews(...args),
}))

const review = {
  id: 1, branchId: 5, courtId: 1, reviewerName: 'Nguyen A', reviewerAvatarUrl: null, rating: 4,
  comment: 'San dep', imageUrls: [], adminReply: 'Cam on ban', createdAt: '2026-11-01T00:00:00Z', repliedAt: null,
}

describe('BranchReviews', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks() })

  it('shows the empty state', () => {
    useReviews.mockReturnValue({ data: { content: [], totalElements: 0, totalPages: 0, averageRating: 0 }, isPending: false, error: null })
    render(<BranchReviews branchId="5" />)
    expect(screen.getByText('Chưa có đánh giá nào cho cơ sở này.')).toBeTruthy()
  })

  it('renders reviews with summary and owner reply, and pages forward', () => {
    useReviews.mockReturnValue({ data: { content: [review], totalElements: 12, totalPages: 2, averageRating: 4.25 }, isPending: false, error: null })
    render(<BranchReviews branchId="5" />)
    expect(screen.getByText('4.3 (12 đánh giá)')).toBeTruthy()
    expect(screen.getByText('Nguyen A')).toBeTruthy()
    expect(screen.getByText('Cam on ban')).toBeTruthy()
    fireEvent.click(screen.getByText('Trang sau'))
    expect(useReviews).toHaveBeenLastCalledWith('5', 1)
  })

  it('shows the error message', () => {
    useReviews.mockReturnValue({ data: undefined, isPending: false, error: new Error('boom') })
    render(<BranchReviews branchId="5" />)
    expect(screen.getByRole('alert')).toBeTruthy()
  })
})
