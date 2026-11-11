import { describe, expect, it } from 'vitest'

import { pageOf, sortedBy } from './paging'

describe('paging helpers', () => {
  it('slices a plain array into a Spring-like page', () => {
    const page = pageOf([1, 2, 3, 4, 5], 1, 2)
    expect(page.content).toEqual([3, 4])
    expect(page).toMatchObject({ number: 1, size: 2, totalElements: 5, totalPages: 3, first: false, last: false })
  })

  it('reports an empty list as a single empty last page', () => {
    expect(pageOf([], 0, 10)).toMatchObject({ totalPages: 0, first: true, last: true, empty: true })
  })

  it('sorts text with Vietnamese collation and respects the direction', () => {
    const items = [{ name: 'Đống Đa' }, { name: 'Ba Đình' }, { name: 'Cầu Giấy' }]
    expect(sortedBy(items, 'name', 'asc').map((item) => item.name)).toEqual(['Ba Đình', 'Cầu Giấy', 'Đống Đa'])
    expect(sortedBy(items, 'name', 'desc')[0].name).toBe('Đống Đa')
  })
})
