import { keepPreviousData, useQuery } from '@tanstack/react-query'

import {
  getPublicBranch,
  getPublicBranchCourts,
  getPublicBranchImages,
  getPublicBranchReviews,
  getPublicCourtSlots,
  searchPublicBranches,
} from '@/services/branch/public-branch.api'
import type { PublicBranchSearchParams } from '@/types/public-branch'

export const publicBranchKeys = {
  all: ['public-branches'] as const,
  search: (params: PublicBranchSearchParams) => ['public-branches', 'search', params] as const,
  detail: (id: string | number) => ['public-branches', 'detail', String(id)] as const,
  courts: (id: string | number) => ['public-branches', 'courts', String(id)] as const,
  images: (id: string | number) => ['public-branches', 'images', String(id)] as const,
  reviews: (id: string | number, page: number) => ['public-branches', 'reviews', String(id), page] as const,
  slots: (courtId: string | number, date: string) => ['public-courts', 'slots', String(courtId), date] as const,
}

export function usePublicBranchSearch(params: PublicBranchSearchParams) {
  return useQuery({
    queryKey: publicBranchKeys.search(params),
    queryFn: () => searchPublicBranches(params),
    placeholderData: keepPreviousData,
  })
}

export function usePublicBranch(id: string | undefined) {
  return useQuery({
    queryKey: publicBranchKeys.detail(id ?? ''),
    queryFn: () => getPublicBranch(id as string),
    enabled: Boolean(id),
  })
}

export function usePublicBranchCourts(id: string | undefined) {
  return useQuery({
    queryKey: publicBranchKeys.courts(id ?? ''),
    queryFn: () => getPublicBranchCourts(id as string),
    enabled: Boolean(id),
  })
}

export function usePublicBranchImages(id: string | undefined) {
  return useQuery({
    queryKey: publicBranchKeys.images(id ?? ''),
    queryFn: () => getPublicBranchImages(id as string),
    enabled: Boolean(id),
  })
}

export function usePublicBranchReviews(id: string | undefined, page: number) {
  return useQuery({
    queryKey: publicBranchKeys.reviews(id ?? '', page),
    queryFn: () => getPublicBranchReviews(id as string, page),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  })
}

export function usePublicCourtSlots(courtId: number | null, date: string) {
  return useQuery({
    queryKey: publicBranchKeys.slots(courtId ?? 0, date),
    queryFn: () => getPublicCourtSlots(courtId as number, date),
    enabled: courtId !== null,
  })
}
