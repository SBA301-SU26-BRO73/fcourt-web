import type { BranchLockRequest, CourtLockType, LockDetailsRequest, LockSlotsRequest } from '@/types/court-lock'

/** A lock window spans at most this many days (facility-service `LockService.MAX_WINDOW`). */
export const MAX_LOCK_DAYS = 31

/** `court`: one court. `courts`: chosen courts of a branch. `branch`: every court of a branch. */
export type LockScope = 'court' | 'courts' | 'branch'

export interface CourtLockFormValues {
  scope: LockScope
  branchId: string
  courtId: string
  courtIds: string[]
  /** `yyyy-MM-ddTHH:mm` from a datetime-local input. */
  startAt: string
  endAt: string
  type: CourtLockType
  reason: string
  notes: string
  publicReason: string
  contactName: string
  contactPhone: string
}

export type CourtLockFormErrors = Partial<Record<keyof CourtLockFormValues, string>>

export function emptyCourtLockFormValues(branchId = ''): CourtLockFormValues {
  return {
    scope: 'court',
    branchId,
    courtId: '',
    courtIds: [],
    startAt: '',
    endAt: '',
    type: 'OUT_OF_SERVICE',
    reason: '',
    notes: '',
    publicReason: '',
    contactName: '',
    contactPhone: '',
  }
}

function parse(value: string) {
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}

function onHalfHour(value: string) {
  const minutes = Number(value.slice(14, 16))
  return minutes === 0 || minutes === 30
}

export function validateCourtLockForm(values: CourtLockFormValues, now = new Date()): CourtLockFormErrors {
  const errors: CourtLockFormErrors = {}

  if (!(Number(values.branchId) > 0)) errors.branchId = 'Chi nhánh là bắt buộc.'
  if (values.scope === 'court' && !(Number(values.courtId) > 0)) errors.courtId = 'Chọn một sân.'
  if (values.scope === 'courts' && values.courtIds.length === 0) errors.courtIds = 'Chọn ít nhất một sân.'

  const start = values.startAt ? parse(values.startAt) : null
  const end = values.endAt ? parse(values.endAt) : null
  if (start === null) errors.startAt = 'Thời điểm bắt đầu là bắt buộc.'
  else if (!onHalfHour(values.startAt)) errors.startAt = 'Phút phải là 00 hoặc 30.'
  if (end === null) errors.endAt = 'Thời điểm kết thúc là bắt buộc.'
  else if (!onHalfHour(values.endAt)) errors.endAt = 'Phút phải là 00 hoặc 30.'
  if (start !== null && end !== null && !errors.endAt) {
    if (end <= start) errors.endAt = 'Thời điểm kết thúc phải sau thời điểm bắt đầu.'
    else if (end <= now.getTime()) errors.endAt = 'Khoảng khóa đã nằm trong quá khứ.'
    else if (end - start > MAX_LOCK_DAYS * 24 * 3_600_000) errors.endAt = `Khoảng khóa tối đa ${MAX_LOCK_DAYS} ngày.`
  }

  const reason = values.reason.trim()
  if (!reason) errors.reason = 'Lý do là bắt buộc.'
  else if (reason.length > 500) errors.reason = 'Lý do tối đa 500 ký tự.'
  if (values.notes.length > 1000) errors.notes = 'Ghi chú tối đa 1000 ký tự.'
  if (values.publicReason.length > 500) errors.publicReason = 'Lý do hiển thị cho khách tối đa 500 ký tự.'
  if (values.contactName.length > 100) errors.contactName = 'Tên liên hệ tối đa 100 ký tự.'
  const phone = values.contactPhone.trim()
  if (phone && !/^\+?[0-9]{9,15}$/.test(phone)) errors.contactPhone = 'Số điện thoại gồm 9 đến 15 chữ số, có thể bắt đầu bằng +.'
  return errors
}

function details(values: CourtLockFormValues): LockDetailsRequest {
  const notes = values.notes.trim()
  const publicReason = values.publicReason.trim()
  const contactName = values.contactName.trim()
  const contactPhone = values.contactPhone.trim()
  return {
    startAt: `${values.startAt}:00`,
    endAt: `${values.endAt}:00`,
    type: values.type,
    reason: values.reason.trim(),
    ...(notes ? { notes } : {}),
    ...(publicReason ? { publicReason } : {}),
    ...(contactName ? { contactName } : {}),
    ...(contactPhone ? { contactPhone } : {}),
  }
}

export function toLockSlotsRequest(values: CourtLockFormValues): LockSlotsRequest {
  return { courtId: Number(values.courtId), ...details(values) }
}

export function toBranchLockRequest(values: CourtLockFormValues): BranchLockRequest {
  return {
    branchId: Number(values.branchId),
    ...(values.scope === 'branch' ? { allCourts: true } : { courtIds: values.courtIds.map(Number) }),
    ...details(values),
  }
}

/** `yyyy-MM-ddTHH:mm:ss` from the server into the datetime-local format. */
export function toInputDateTime(value: string) {
  return value.slice(0, 16)
}
