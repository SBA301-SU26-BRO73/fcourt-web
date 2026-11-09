import type { PublicBranchSearchParams } from '@/types/public-branch'

export const BRANCH_PAGE_SIZE = 6

/** Maps the list page URL (?keyword&city&district&courtTypeId&available&page) to the search request. */
export function paramsFromUrl(searchParams: URLSearchParams): PublicBranchSearchParams {
  const courtTypeId = Number(searchParams.get('courtTypeId'))
  const page = Number(searchParams.get('page'))
  return {
    query: searchParams.get('keyword') ?? undefined,
    city: searchParams.get('city') ?? undefined,
    district: searchParams.get('district') ?? undefined,
    courtTypeId: Number.isInteger(courtTypeId) && courtTypeId > 0 ? courtTypeId : undefined,
    hasAvailableSlotsToday: searchParams.get('available') === '1' ? true : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 0,
    size: BRANCH_PAGE_SIZE,
  }
}

export function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
}

/** "120.000 ₫ - 200.000 ₫", a single price when min = max, null when the branch has no priced slot. */
export function formatPriceRange(min: number | null, max: number | null) {
  if (min == null && max == null) return null
  if (min == null || max == null || min === max) return formatVnd((min ?? max) as number)
  return `${formatVnd(min)} - ${formatVnd(max)}`
}

export function formatHour(value: string | null | undefined) {
  return value?.slice(0, 5) || '--:--'
}
