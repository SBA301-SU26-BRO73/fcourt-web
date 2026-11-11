import type { MyBooking, RefundState, RefundStatus } from '@/types/my-booking'

export const FILTER_TABS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'UPCOMING', label: 'Sắp tới' },
  { value: 'COMPLETED', label: 'Hoàn tất' },
  { value: 'CANCELLED', label: 'Đã hủy' },
] as const

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  PENDING: 'Đã gửi yêu cầu, chờ chủ sân duyệt',
  APPROVED: 'Đã duyệt, chờ chuyển khoản',
  REJECTED: 'Bị từ chối',
  COMPLETED: 'Đã hoàn tiền',
}

/** VietQR bank directory (same 970xxx BIN list as the Flutter app, snapshot 2026-11-01). */
export const VIETNAM_BANKS = [
  ['970415', 'VietinBank'], ['970436', 'Vietcombank'], ['970418', 'BIDV'], ['970405', 'Agribank'],
  ['970448', 'OCB'], ['970422', 'MBBank'], ['970407', 'Techcombank'], ['970416', 'ACB'],
  ['970432', 'VPBank'], ['970423', 'TPBank'], ['970403', 'Sacombank'], ['970437', 'HDBank'],
  ['970454', 'VietCapitalBank'], ['970429', 'SCB'], ['970441', 'VIB'], ['970443', 'SHB'],
  ['970431', 'Eximbank'], ['970426', 'MSB'], ['970400', 'SaigonBank'], ['970409', 'BacABank'],
  ['970412', 'PVcomBank'], ['970414', 'MBV'], ['970419', 'NCB'], ['970424', 'ShinhanBank'],
  ['970425', 'ABBANK'], ['970427', 'VietABank'], ['970428', 'NamABank'], ['970430', 'PGBank'],
  ['970433', 'VietBank'], ['970438', 'BaoVietBank'], ['970440', 'SeABank'], ['970446', 'COOPBANK'],
  ['970449', 'LPBank'], ['970452', 'KienLongBank'], ['970434', 'IndovinaBank'], ['970444', 'CBBank'],
  ['970457', 'Woori'], ['970462', 'KookminHN'], ['970463', 'KookminHCM'],
].map(([bin, name]) => ({ bin, name }))

export function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
}

export function formatClock(value: string) {
  return value.slice(0, 5)
}

export function formatDateTime(value: string | null) {
  if (!value) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value))
}

/** The customer may try to cancel before the booking is used; the server policy has the last word. */
export function canTryCancel(booking: MyBooking) {
  return (
    booking.status === 'PENDING_PAYMENT' ||
    booking.status === 'AWAITING_CONFIRMATION' ||
    booking.status === 'CONFIRMED'
  )
}

export function hasTicket(booking: MyBooking) {
  return booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN' || booking.status === 'COMPLETED'
}

/** A cancelled booking can carry a refund only when the server computed an entitlement. */
export function mayHaveRefund(booking: MyBooking) {
  return booking.status === 'CANCELLED' && (booking.refundAmount ?? 0) > 0
}

export function canRequestRefund(state: RefundState | undefined) {
  return !!state && state.eligible && !state.request
}

export function canReview(booking: MyBooking) {
  return booking.status === 'COMPLETED'
}

/** Bank account numbers are 6-20 digits and the BIN is 970xxx (RefundService.Request). */
export function validateRefundForm(form: {
  bankBin: string
  accountNumber: string
  accountName: string
  reason: string
}) {
  const errors: Record<string, string> = {}
  if (!/^970\d{3}$/.test(form.bankBin)) errors.bankBin = 'Vui lòng chọn ngân hàng'
  if (!/^\d{6,20}$/.test(form.accountNumber.trim())) errors.accountNumber = 'Số tài khoản gồm 6-20 chữ số'
  const name = form.accountName.trim()
  if (name.length < 2 || name.length > 150) errors.accountName = 'Tên chủ tài khoản 2-150 ký tự'
  const reason = form.reason.trim()
  if (!reason || reason.length > 500) errors.reason = 'Lý do bắt buộc, tối đa 500 ký tự'
  return errors
}

export function transactionStatusLabel(status: string) {
  if (status === 'SUCCESS') return 'Thành công'
  if (status === 'PENDING') return 'Chờ xác nhận'
  return 'Bị từ chối'
}
