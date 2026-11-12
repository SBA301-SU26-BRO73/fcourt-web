import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient, SKIP_AUTH_HEADER } from '@/services/http/axios-client'
import { normalizeLookupPhone } from '@/services/booking/booking.api'
import type { Refund, RefundState } from '@/types/my-booking'

export interface GuestRefundIdentity {
  bookingCode: string
  phone: string
}

export interface GuestRefundPayload extends GuestRefundIdentity {
  bankName: string
  accountNumber: string
  accountHolder: string
  bankBin?: string
}

function identity(payload: GuestRefundIdentity) {
  return { bookingCode: payload.bookingCode.trim().toUpperCase(), phone: normalizeLookupPhone(payload.phone) }
}

const publicConfig = { headers: { [SKIP_AUTH_HEADER]: 'true' } }

export async function lookupGuestRefund(payload: GuestRefundIdentity) {
  const { data } = await axiosClient.post<RefundState>(API_ENDPOINTS.refunds.guestLookup, identity(payload), publicConfig)
  return data
}

export async function requestGuestRefund(payload: GuestRefundPayload) {
  // Explicit allowlist: identity and bank details only; entitlement belongs to the server.
  const { data } = await axiosClient.post<Refund>(API_ENDPOINTS.refunds.guestRequest, {
    ...identity(payload),
    bankName: payload.bankName.trim(),
    accountNumber: payload.accountNumber.trim(),
    accountHolder: payload.accountHolder.trim(),
    ...(payload.bankBin?.trim() ? { bankBin: payload.bankBin.trim() } : {}),
  }, publicConfig)
  return data
}
