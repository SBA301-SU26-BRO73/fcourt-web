import type { SpringPage } from '@/types/branch'

/**
 * Some owner endpoints return a plain array with no paging parameters
 * (`GET /admin/branches`, `GET /admin/branches/{id}/courts`). The old screens page
 * and sort, so this does it on the client with the same shape the screens already read.
 */
export function pageOf<T>(items: T[], page: number, size: number): SpringPage<T> {
  const safeSize = Math.max(size, 1)
  const totalElements = items.length
  const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / safeSize)
  const content = items.slice(page * safeSize, page * safeSize + safeSize)
  return {
    content,
    size: safeSize,
    number: page,
    totalElements,
    totalPages,
    numberOfElements: content.length,
    first: page === 0,
    last: totalPages === 0 || page >= totalPages - 1,
    empty: content.length === 0,
  }
}

export function sortedBy<T>(items: T[], field: keyof T, direction: 'asc' | 'desc'): T[] {
  const sign = direction === 'desc' ? -1 : 1
  return [...items].sort((x, y) => {
    const a = x[field] ?? ''
    const b = y[field] ?? ''
    if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b, 'vi') * sign
    return a > b ? sign : a < b ? -sign : 0
  })
}
