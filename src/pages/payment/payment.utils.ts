import { isApiError } from '@/common/utils/api-error'
import type { CheckoutInfo, CompactPaymentStatus } from '@/types/checkout'

/**
 * VietQR quick link (https://www.vietqr.io/qr-dong). Bank details are sent to img.vietqr.io to
 * draw the image; no auth or hold token is ever put in the URL.
 */
export function buildVietQrUrl(info: Pick<CheckoutInfo, 'bankBin' | 'bankAccountNumber' | 'bankAccountName' | 'amount' | 'transferContent'>) {
  const query = new URLSearchParams({
    amount: String(Math.round(info.amount)),
    addInfo: info.transferContent,
    accountName: info.bankAccountName,
  })
  return `https://img.vietqr.io/image/${info.bankBin}-${info.bankAccountNumber}-compact2.png?${query.toString()}`
}

export function isFreeCheckout(info: Pick<CheckoutInfo, 'amount'>) {
  return info.amount === 0
}

export const POLL_BASE_MS = 4_000
export const POLL_MAX_MS = 30_000
/** After this long the page stops polling on its own; a submitted receipt is never cancelled by it. */
export const POLL_DEADLINE_MS = 10 * 60_000

/**
 * Delay before the next status poll, or false to stop. Polls are sequential every 4 s, back off
 * exponentially (4, 8, 16, 30 s) after failures, and stop on a decision or after the deadline.
 */
export function nextPollDelay(input: {
  state: CompactPaymentStatus['paymentStatus'] | null
  failures: number
  startedAt: number
  now: number
}) {
  if (input.state === 'SUCCESS' || input.state === 'REJECTED') return false
  if (input.now - input.startedAt >= POLL_DEADLINE_MS) return false
  if (input.failures <= 0) return POLL_BASE_MS
  return Math.min(POLL_MAX_MS, POLL_BASE_MS * 2 ** input.failures)
}

export type CheckoutFailure = 'expired' | 'not-awaiting-payment' | 'forbidden' | 'not-found' | 'bank-not-configured' | 'network' | 'other'

/** Classifies the error of checkout-info / booking detail the way the Flutter screen does. */
export function classifyCheckoutError(error: unknown): CheckoutFailure {
  if (!isApiError(error)) return 'other'
  if (error.isNetworkError) return 'network'
  switch (error.status) {
    case 410:
      return 'expired'
    case 409:
      return 'not-awaiting-payment'
    case 401:
    case 403:
      return 'forbidden'
    case 422:
      return 'bank-not-configured'
    case 404:
      return 'not-found'
    default:
      return 'other'
  }
}

export const CHECKOUT_FAILURE_MESSAGE: Record<CheckoutFailure, string> = {
  expired: 'Đã hết thời gian giữ chỗ hoặc đơn đã bị hủy. Vui lòng chọn lại khung giờ.',
  'not-awaiting-payment': 'Đơn này không còn ở trạng thái chờ thanh toán.',
  forbidden: 'Bạn không có quyền xem đơn này. Vui lòng đăng nhập đúng tài khoản đã đặt sân.',
  'not-found': 'Không tìm thấy đơn đặt sân.',
  'bank-not-configured': 'Chi nhánh chưa cấu hình đủ thông tin tài khoản ngân hàng để thanh toán. Vui lòng liên hệ chi nhánh hoặc chọn chi nhánh khác.',
  network: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.',
  other: 'Không thể tải thông tin thanh toán. Vui lòng thử lại.',
}

export type HoldCheckoutStage = 'empty' | 'expired' | 'wrong-role' | 'creating' | 'error'

/**
 * What /payment (without ?bookingId) shows for a stored hold. POST /api/bookings accepts a guest
 * (no login: the hold token and the phone sealed in the hold are the credential) or a CUSTOMER;
 * any other signed-in role cannot book online.
 */
export function resolveHoldCheckoutStage(input: {
  hasHold: boolean
  expired: boolean
  role: string | null
  createFailed: boolean
}): HoldCheckoutStage {
  if (!input.hasHold) return 'empty'
  if (input.expired) return 'expired'
  if (input.role !== null && input.role !== 'CUSTOMER') return 'wrong-role'
  return input.createFailed ? 'error' : 'creating'
}

export function parsePositiveInt(value: string | null) {
  if (!value || !/^[1-9][0-9]{0,15}$/.test(value)) return null
  return Number(value)
}

export function loginPathFor(next: string) {
  return `/auth/login?role=customer&next=${encodeURIComponent(next)}`
}

export type ConfirmationView =
  | { kind: 'pending'; stalled: boolean }
  | { kind: 'approved'; hasTicket: boolean }
  | { kind: 'rejected'; reason: string | null }
  | { kind: 'cancelled' }
  | { kind: 'error'; failure: CheckoutFailure }

const PAID_STATUSES = ['CONFIRMED', 'CHECKED_IN', 'COMPLETED']

/**
 * Screen state of /confirmation from the compact payment status and the booking. The booking
 * can lag behind the payment (Kafka), so an approved payment without a checkInCode still shows
 * "approved" while the ticket syncs. A rejected receipt cancels the booking server-side.
 */
export function resolveConfirmationView(input: {
  paymentState: CompactPaymentStatus['paymentStatus'] | null
  rejectReason: string | null
  paymentError: unknown
  bookingStatus: string | null
  checkInCode: string | null
  deadlineReached: boolean
}): ConfirmationView {
  const hasTicket = Boolean(input.checkInCode)
  if (input.paymentState === 'SUCCESS' || (input.bookingStatus && PAID_STATUSES.includes(input.bookingStatus))) {
    return { kind: 'approved', hasTicket }
  }
  if (input.paymentState === 'REJECTED') return { kind: 'rejected', reason: input.rejectReason }
  if (input.bookingStatus === 'CANCELLED') return { kind: 'cancelled' }
  if (input.paymentError && input.paymentState === null) {
    const failure = classifyCheckoutError(input.paymentError)
    // 404 right after the upload only means the receipt row is not visible yet: keep waiting.
    if (failure === 'expired') return { kind: 'cancelled' }
    if (failure !== 'not-found') return { kind: 'error', failure }
  }
  return { kind: 'pending', stalled: input.deadlineReached }
}
