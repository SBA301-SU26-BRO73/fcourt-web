import type {
  Branch,
  BranchRequest,
  BranchStatus,
} from '@/types/branch'
import { findDistrictForWard } from '@/data/sample-locations'

export interface BranchFormValues {
  name: string
  address: string
  ward: string
  district: string
  city: string
  phone: string
  openTime: string
  closeTime: string
  slotDurationMinutes: string
  bankName: string
  bankBin: string
  bankAccountNumber: string
  bankAccountName: string
  status: BranchStatus
}

export type BranchFormErrors = Partial<Record<keyof BranchFormValues, string>>

export const emptyBranchFormValues: BranchFormValues = {
  name: '',
  address: '',
  ward: '',
  district: '',
  city: '',
  phone: '',
  openTime: '06:00',
  closeTime: '22:00',
  slotDurationMinutes: '30',
  bankName: '',
  bankBin: '',
  bankAccountNumber: '',
  bankAccountName: '',
  status: 'ACTIVE',
}

const maxLengths: Partial<Record<keyof BranchFormValues, number>> = {
  name: 150,
  address: 255,
  ward: 100,
  district: 100,
  city: 100,
  bankName: 100,
  bankAccountName: 150,
}

/** Gallery limits enforced by facility-service (ImageUploadValidator, max-per-branch). */
export const GALLERY_MAX_IMAGES = 10
export const GALLERY_MAX_BYTES = 5 * 1024 * 1024
const GALLERY_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function branchToFormValues(branch: Branch): BranchFormValues {
  return {
    name: branch.name,
    address: branch.address,
    ward: branch.ward ?? '',
    district: branch.district || findDistrictForWard(branch.city, branch.ward ?? '')?.name || '',
    city: branch.city,
    phone: branch.phone ?? '',
    openTime: branch.openTime.slice(0, 5),
    closeTime: branch.closeTime.slice(0, 5),
    slotDurationMinutes: String(branch.slotDurationMinutes ?? 30),
    bankName: branch.bankName ?? '',
    bankBin: branch.bankBin ?? '',
    bankAccountNumber: branch.bankAccountNumber ?? '',
    bankAccountName: branch.bankAccountName ?? '',
    status: branch.status,
  }
}

export function validateBranchForm(values: BranchFormValues): BranchFormErrors {
  const errors: BranchFormErrors = {}

  const labels = {
    name: 'Tên chi nhánh',
    address: 'Địa chỉ',
    city: 'Tỉnh/Thành phố',
    district: 'Quận/Huyện',
    ward: 'Phường/Xã',
    bankName: 'Tên ngân hàng',
    bankBin: 'Mã BIN ngân hàng',
    bankAccountNumber: 'Số tài khoản',
    bankAccountName: 'Tên chủ tài khoản',
  } as const
  for (const field of Object.keys(labels) as Array<keyof typeof labels>) {
    if (!values[field].trim()) errors[field] = `${labels[field]} là bắt buộc.`
  }

  for (const [field, maxLength] of Object.entries(maxLengths) as Array<
    [keyof BranchFormValues, number]
  >) {
    if (!errors[field] && values[field].trim().length > maxLength) {
      errors[field] = `Không được vượt quá ${maxLength} ký tự.`
    }
  }

  if (values.phone.trim() && !/^\+?[0-9]{8,15}$/.test(values.phone.trim())) {
    errors.phone = 'Số điện thoại gồm 8-15 chữ số.'
  }
  if (!errors.bankBin && !/^[0-9]{6}$/.test(values.bankBin.trim())) {
    errors.bankBin = 'Mã BIN gồm đúng 6 chữ số.'
  }
  if (!errors.bankAccountNumber && !/^[0-9]{6,20}$/.test(values.bankAccountNumber.trim())) {
    errors.bankAccountNumber = 'Số tài khoản gồm 6-20 chữ số.'
  }

  if (!values.openTime) errors.openTime = 'Giờ mở cửa là bắt buộc.'
  if (!values.closeTime) errors.closeTime = 'Giờ đóng cửa là bắt buộc.'
  if (!['30', '60'].includes(values.slotDurationMinutes)) errors.slotDurationMinutes = 'Chọn 30 hoặc 60 phút.'
  if (values.openTime && values.closeTime && values.openTime >= values.closeTime) {
    errors.closeTime = 'Giờ đóng cửa phải sau giờ mở cửa.'
  }

  return errors
}

function nullable(value: string) {
  return value.trim() || null
}

/** The backend reads "HH:mm" (and "HH:mm:ss"); the form already holds "HH:mm". */
function toApiTime(value: string) {
  return value.slice(0, 5)
}

/** Latitude/longitude are not edited on this form; an edit keeps whatever the branch already has. */
export function toBranchPayload(
  values: BranchFormValues,
  branch?: Pick<Branch, 'latitude' | 'longitude'>,
): BranchRequest {
  return {
    name: values.name.trim(),
    address: values.address.trim(),
    ward: nullable(values.ward),
    district: nullable(values.district),
    city: values.city.trim(),
    latitude: branch?.latitude ?? null,
    longitude: branch?.longitude ?? null,
    phone: nullable(values.phone),
    openTime: toApiTime(values.openTime),
    closeTime: toApiTime(values.closeTime),
    slotDurationMinutes: Number(values.slotDurationMinutes) as 30 | 60,
    bankName: values.bankName.trim(),
    bankBin: values.bankBin.trim(),
    bankAccountNumber: values.bankAccountNumber.trim(),
    bankAccountName: values.bankAccountName.trim(),
    status: values.status,
  }
}

/** Returns an error message for the first file that cannot go into the gallery, else null. */
export function validateGalleryFiles(
  existingCount: number,
  staged: File[],
  incoming: File[],
): string | null {
  for (const file of incoming) {
    if (!GALLERY_TYPES.includes(file.type)) return 'Chỉ nhận ảnh JPEG, PNG hoặc WebP.'
    if (file.size > GALLERY_MAX_BYTES) return 'Dung lượng mỗi ảnh không được vượt quá 5 MB.'
  }
  if (existingCount + staged.length + incoming.length > GALLERY_MAX_IMAGES) {
    return `Mỗi chi nhánh tối đa ${GALLERY_MAX_IMAGES} ảnh.`
  }
  return null
}
