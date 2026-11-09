import type { CreateStaffRequest, StaffResponse, StaffShift, UpdateStaffRequest } from '@/types/staff'

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** Same pattern as the server: optional +, 9-15 digits. */
export const PHONE_RE = /^\+?[0-9]{9,15}$/
export const PASSWORD_MIN = 12
export const PASSWORD_MAX = 72
export const MAX_SHIFTS = 28

export const DAY_LABELS: Record<number, string> = {
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
  7: 'Chủ nhật',
}

export interface StaffFormValues {
  email: string
  password: string
  fullName: string
  phone: string
  shifts: StaffShift[]
}

export const emptyStaffFormValues: StaffFormValues = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  shifts: [],
}

/** The server answers `HH:mm:ss` and only accepts whole minutes: keep `HH:mm`. */
export function toMinutePrecision(time: string) {
  return time.slice(0, 5)
}

export function staffToFormValues(staff: StaffResponse): StaffFormValues {
  return {
    email: staff.email,
    password: '',
    fullName: staff.fullName,
    phone: staff.phone ?? '',
    shifts: staff.shifts.map((shift) => ({
      dayOfWeek: shift.dayOfWeek,
      startTime: toMinutePrecision(shift.startTime),
      endTime: toMinutePrecision(shift.endTime),
    })),
  }
}

/** Returns a message for the first empty, inverted or overlapping shift, or null. */
export function validateShifts(shifts: StaffShift[]): string | null {
  if (shifts.length > MAX_SHIFTS) return `Tối đa ${MAX_SHIFTS} ca làm việc.`
  for (const shift of shifts) {
    if (!shift.startTime || !shift.endTime) return 'Nhập giờ bắt đầu và kết thúc cho mỗi ca.'
    if (shift.endTime <= shift.startTime) return 'Giờ kết thúc phải sau giờ bắt đầu.'
  }
  const sorted = [...shifts].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i - 1].dayOfWeek === sorted[i].dayOfWeek && sorted[i].startTime < sorted[i - 1].endTime) {
      return `Các ca ${DAY_LABELS[sorted[i].dayOfWeek]} bị trùng giờ.`
    }
  }
  return null
}

export type StaffFormErrors = Partial<Record<'email' | 'password' | 'fullName' | 'phone' | 'shifts', string>>

export function validateStaffForm(values: StaffFormValues, isEdit: boolean): StaffFormErrors {
  const errors: StaffFormErrors = {}
  if (!isEdit) {
    if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Nhập đúng định dạng email (vd: name@bro73.app)'
    if (values.password.length < PASSWORD_MIN) errors.password = `Mật khẩu tối thiểu ${PASSWORD_MIN} ký tự.`
    else if (new TextEncoder().encode(values.password).length > PASSWORD_MAX) {
      errors.password = `Mật khẩu tối đa ${PASSWORD_MAX} byte.`
    }
  }
  if (!values.fullName.trim()) errors.fullName = 'Nhập họ tên nhân viên.'
  else if (values.fullName.trim().length > 150) errors.fullName = 'Họ tên tối đa 150 ký tự.'
  if (!PHONE_RE.test(values.phone.trim())) errors.phone = 'Số điện thoại gồm 9-15 chữ số (có thể bắt đầu bằng +).'
  const shiftError = validateShifts(values.shifts)
  if (shiftError) errors.shifts = shiftError
  return errors
}

export function toCreateStaffRequest(values: StaffFormValues, branchId: number): CreateStaffRequest {
  return {
    branchId,
    email: values.email.trim(),
    password: values.password,
    fullName: values.fullName.trim(),
    phone: values.phone.trim(),
    shifts: values.shifts,
  }
}

export function toUpdateStaffRequest(values: StaffFormValues): UpdateStaffRequest {
  return {
    fullName: values.fullName.trim(),
    phone: values.phone.trim(),
    shifts: values.shifts,
  }
}
