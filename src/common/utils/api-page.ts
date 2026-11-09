import type { SpringPage } from '@/types/voucher'


/** `{ items, page, size, total }` (voucher-service, reporting) into the page shape the screens read. */
export function pageFromApi<T>(raw: { items: T[]; page: number; size: number; total: number }): SpringPage<T> {
  const size = Math.max(raw.size, 1)
  const totalPages = raw.total === 0 ? 0 : Math.ceil(raw.total / size)
  return {
    content: raw.items,
    size: raw.size,
    number: raw.page,
    totalElements: raw.total,
    totalPages,
    numberOfElements: raw.items.length,
    first: raw.page === 0,
    last: totalPages === 0 || raw.page >= totalPages - 1,
    empty: raw.items.length === 0,
  }
}
