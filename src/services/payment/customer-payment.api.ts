import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import { holdTokenHeaders } from '@/services/booking/booking.api'
import type { CheckoutInfo, CompactPaymentStatus, FreePayment, ReceiptStatus } from '@/types/checkout'

export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024
export const RECEIPT_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

/** Client-side check of the receipt file (server: decoded JPEG/PNG up to 5 MiB / 25 megapixels). */
export function validateReceiptFile(file: Pick<File, 'type' | 'size'>) {
  if (!RECEIPT_TYPES.includes(file.type)) return 'Chỉ chấp nhận ảnh PNG hoặc JPG.'
  if (file.size <= 0) return 'Ảnh biên lai trống.'
  if (file.size > RECEIPT_MAX_BYTES) return 'Ảnh biên lai vượt quá 5MB.'
  return null
}

/** GET /payments/checkout-info/{bookingId}: 410 once the hold expired, 409 when not awaiting payment. */
export async function getCheckoutInfo(bookingId: number, holdToken?: string | null) {
  const { data } = await axiosClient.get<CheckoutInfo>(API_ENDPOINTS.payments.checkoutInfo(bookingId), {
    headers: holdTokenHeaders(holdToken),
  })
  // Older servers prepend FC even when the booking code already carries that prefix.
  return { ...data, transferContent: data.transferContent.replace(/^FC\s+(?=FC)/i, '') }
}

/**
 * POST /payments/{bookingId}/upload-receipt (multipart part `file`). A retry returns the existing
 * payment and never replaces the receipt, so the same booking cannot be re-uploaded after a reject.
 */
export async function uploadReceipt(bookingId: number, file: File, holdToken?: string | null) {
  const invalid = validateReceiptFile(file)
  if (invalid) throw new Error(invalid)
  const form = new FormData()
  form.append('file', file)
  const { data } = await axiosClient.post<ReceiptStatus>(API_ENDPOINTS.payments.uploadReceipt(bookingId), form, {
    headers: { 'Content-Type': 'multipart/form-data', ...holdTokenHeaders(holdToken) },
    timeout: 60_000,
  })
  return data
}

/** GET /payments/{bookingId}/status?compact=true: 404 until a receipt exists, 410 when cancelled. */
export async function getPaymentStatus(bookingId: number, holdToken?: string | null) {
  const { data } = await axiosClient.get<CompactPaymentStatus>(API_ENDPOINTS.payments.status(bookingId), {
    params: { compact: true },
    headers: holdTokenHeaders(holdToken),
  })
  return data
}

/** POST /payments/{bookingId}/confirm-free: only for a voucher-discounted booking that costs 0 VND. */
export async function confirmFreeBooking(bookingId: number) {
  const { data } = await axiosClient.post<FreePayment>(API_ENDPOINTS.payments.confirmFree(bookingId))
  return data
}
