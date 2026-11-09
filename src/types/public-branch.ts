/** Shapes of the public (anonymous) discovery endpoints, see docs/api-gap-report.md F1. */

export interface PublicBranchSummary {
  id: number
  name: string
  address: string
  city: string
  district: string | null
  latitude: number | null
  longitude: number | null
  minPrice: number | null
  maxPrice: number | null
  courtCount: number
  distanceKm: number | null
  averageRating: number
  reviewCount: number
  /** Cover photo, "HH:mm" hours and court type ids: discovery-service card fields (null until the branch is re-projected). */
  imageUrl?: string | null
  openTime?: string | null
  closeTime?: string | null
  courtTypeIds?: number[]
}

export interface PublicBranchPage {
  content: PublicBranchSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PublicBranchSearchParams {
  query?: string
  city?: string
  district?: string
  courtTypeId?: number
  minPrice?: number
  maxPrice?: number
  latitude?: number
  longitude?: number
  hasAvailableSlotsToday?: boolean
  /** "HH:mm - HH:mm" */
  timeSlot?: string
  /** 0-based */
  page?: number
  size?: number
}

export interface PublicBranchDetail {
  id: number
  name: string
  address: string
  ward?: string | null
  district?: string | null
  city: string
  /** Contact number and opening hours ("HH:mm") shown on the detail page. */
  phone?: string | null
  openTime?: string | null
  closeTime?: string | null
  status: string
}

export interface PublicCourt {
  id: number
  name: string
  courtTypeId: number
  defaultPricePerHour: number
  imageUrl?: string | null
  description?: string | null
}

export interface BranchImage {
  id: number
  branchId: number
  url: string
  sortOrder: number
  createdAt: string
}

export type CourtSlotStatus = 'AVAILABLE' | 'HOLD' | 'BOOKED' | 'OUT_OF_SERVICE' | 'EXPIRED'

export interface CourtSlot {
  slotId: number
  startTime: string
  endTime: string
  price: number
  status: CourtSlotStatus
  restriction?: {
    type: string
    publicReason: string | null
    contactName: string | null
    contactPhone: string | null
  }
}

export interface BranchReview {
  id: number
  branchId: number
  courtId: number
  reviewerName: string
  reviewerAvatarUrl: string | null
  rating: number
  comment: string | null
  imageUrls: string[]
  adminReply: string | null
  createdAt: string
  repliedAt: string | null
}

export interface StarCount {
  rating: number
  count: number
  percentage: number
}

export interface BranchReviewPage {
  content: BranchReview[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  averageRating: number
  starDistribution: StarCount[]
}
