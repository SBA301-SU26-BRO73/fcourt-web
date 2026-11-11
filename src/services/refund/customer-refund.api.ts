import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { Refund, RefundRequestPayload, RefundState } from '@/types/my-booking'

/** Eligibility, amount and any existing request for a cancelled booking. */
export async function getRefundState(bookingId: number) {
  const { data } = await axiosClient.get<RefundState>(API_ENDPOINTS.refunds.byBooking(bookingId))
  return data
}

/** Creates the request (201), or returns the existing one when the same bank details are sent again. */
export async function requestRefund(payload: RefundRequestPayload) {
  const { data } = await axiosClient.post<Refund>(API_ENDPOINTS.refunds.request, {
    ...payload,
    bankAccountNumber: payload.bankAccountNumber.trim(),
    bankAccountName: payload.bankAccountName.trim(),
    reason: payload.reason.trim(),
  })
  return data
}
