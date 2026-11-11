import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type {
  BranchImage,
  BranchReviewPage,
  CourtSlot,
  PublicBranchDetail,
  PublicBranchPage,
  PublicBranchSearchParams,
  PublicCourt,
} from '@/types/public-branch'

/** Drops empty/undefined filters so they are not sent as `?city=`. */
export function buildSearchParams(params: PublicBranchSearchParams) {
  const out: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed) out[key] = trimmed
    } else if (typeof value === 'boolean') {
      if (value) out[key] = true
    } else if (Number.isFinite(value)) {
      out[key] = value
    }
  }
  return out
}

export async function searchPublicBranches(params: PublicBranchSearchParams = {}) {
  const response = await axiosClient.get<PublicBranchPage>(API_ENDPOINTS.branches.list, {
    params: buildSearchParams(params),
  })
  return response.data
}

export async function getPublicBranch(id: string | number) {
  const response = await axiosClient.get<PublicBranchDetail>(API_ENDPOINTS.branches.detail(id))
  return response.data
}

export async function getPublicBranchCourts(id: string | number) {
  const response = await axiosClient.get<PublicCourt[]>(API_ENDPOINTS.branches.courts(id))
  return response.data
}

export async function getPublicBranchImages(id: string | number) {
  const response = await axiosClient.get<BranchImage[]>(API_ENDPOINTS.branches.images(id))
  return [...response.data].sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function getPublicBranchReviews(id: string | number, page = 0, size = 10) {
  const response = await axiosClient.get<BranchReviewPage>(API_ENDPOINTS.branches.reviews(id), {
    params: { page, size },
  })
  return response.data
}

export async function getPublicCourtSlots(courtId: string | number, date: string) {
  const response = await axiosClient.get<CourtSlot[]>(API_ENDPOINTS.courtSlots(courtId), {
    params: { date },
  })
  return response.data
}
