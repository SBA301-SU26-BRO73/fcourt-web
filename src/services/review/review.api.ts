import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { CreatedReview, CreateReviewPayload } from '@/types/my-booking'

export const REVIEW_MAX_IMAGES = 5
export const REVIEW_MAX_IMAGE_BYTES = 5 * 1024 * 1024
const REVIEW_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** Client-side mirror of discovery-service ReviewImageValidator (the server stays authoritative). */
export function validateReviewImages(files: Array<Pick<File, 'type' | 'size'>>): string | null {
  if (files.length > REVIEW_MAX_IMAGES) return `Tối đa ${REVIEW_MAX_IMAGES} ảnh cho mỗi đánh giá`
  for (const file of files) {
    if (!REVIEW_IMAGE_TYPES.includes(file.type)) return 'Chỉ chấp nhận ảnh JPG, PNG hoặc WebP'
    if (file.size > REVIEW_MAX_IMAGE_BYTES) return 'Mỗi ảnh tối đa 5 MB'
  }
  return null
}

/** Uploads review photos (multipart part "files") and returns the URLs to put in `imageUrls`. */
export async function uploadReviewImages(files: File[]) {
  if (files.length === 0) return []
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  const { data } = await axiosClient.post<{ urls: string[] }>(API_ENDPOINTS.reviews.images, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.urls
}

/** Only a COMPLETED booking can be reviewed, once (409 when it already was). */
export async function createReview(payload: CreateReviewPayload) {
  const body: CreateReviewPayload = {
    bookingId: payload.bookingId,
    rating: payload.rating,
    comment: payload.comment?.trim() || undefined,
    imageUrls: payload.imageUrls ?? [],
  }
  const { data } = await axiosClient.post<CreatedReview>(API_ENDPOINTS.reviews.create, body)
  return data
}
