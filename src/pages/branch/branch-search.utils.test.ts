import { describe, expect, it } from 'vitest'

import { formatPriceRange, paramsFromUrl } from './branch-search.utils'

describe('branch search utils', () => {
  it('maps the list URL to search params', () => {
    const params = paramsFromUrl(new URLSearchParams('keyword=cau&city=H%C3%A0%20N%E1%BB%99i&courtTypeId=3&available=1&page=2'))
    expect(params).toMatchObject({ query: 'cau', city: 'Hà Nội', courtTypeId: 3, hasAvailableSlotsToday: true, page: 2, size: 6 })
  })

  it('ignores invalid ids and pages', () => {
    const params = paramsFromUrl(new URLSearchParams('courtTypeId=abc&page=-1'))
    expect(params.courtTypeId).toBeUndefined()
    expect(params.page).toBe(0)
  })

  it('formats price ranges', () => {
    expect(formatPriceRange(null, null)).toBeNull()
    expect(formatPriceRange(100000, 100000)).toContain('100.000')
    expect(formatPriceRange(100000, 200000)).toMatch(/100\.000.*200\.000/)
  })
})
