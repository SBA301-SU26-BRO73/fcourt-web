import type {
  Court,
  CourtStatus,
  CourtRequest,
} from '@/types/court'

export interface CourtFormValues {
  branchId: string
  name: string
  courtTypeId: string
  description: string
  imageUrl: string
  defaultPricePerHour: string
  status: CourtStatus
}

export type CourtFormErrors = Partial<Record<keyof CourtFormValues, string>>

export const emptyCourtFormValues: CourtFormValues = {
  branchId: '',
  name: '',
  courtTypeId: '',
  description: '',
  imageUrl: '',
  defaultPricePerHour: '',
  status: 'ACTIVE',
}

export function courtToFormValues(court: Court): CourtFormValues {
  return {
    branchId: String(court.branchId),
    name: court.name,
    courtTypeId: String(court.courtTypeId),
    description: court.description ?? '',
    imageUrl: court.imageUrl ?? '',
    defaultPricePerHour: String(court.defaultPricePerHour ?? ''),
    status: court.status,
  }
}

export function validateCourtForm(values: CourtFormValues): CourtFormErrors {
  const errors: CourtFormErrors = {}
  const branchId = Number(values.branchId)
  const courtTypeId = Number(values.courtTypeId)

  if (!values.branchId || !Number.isInteger(branchId) || branchId <= 0) {
    errors.branchId = 'Chi nhánh là bắt buộc.'
  }
  if (!values.name.trim()) {
    errors.name = 'Tên sân là bắt buộc.'
  } else if (values.name.trim().length > 150) {
    errors.name = 'Tên sân không được vượt quá 150 ký tự.'
  }
  if (!values.courtTypeId || !Number.isInteger(courtTypeId) || courtTypeId <= 0) {
    errors.courtTypeId = 'Loại sân là bắt buộc.'
  }

  const price = Number(values.defaultPricePerHour)
  if (!values.defaultPricePerHour.trim() || !Number.isFinite(price) || price <= 0) {
    errors.defaultPricePerHour = 'Giá mỗi giờ phải lớn hơn 0.'
  } else if (Math.round(price * 100) !== price * 100 || price >= 1e10) {
    errors.defaultPricePerHour = 'Giá tối đa 10 chữ số và 2 chữ số thập phân.'
  }
  if (values.imageUrl.trim().length > 2048) errors.imageUrl = 'Đường dẫn ảnh không được vượt quá 2048 ký tự.'
  if (values.description.length > 2000) errors.description = 'Mô tả không được vượt quá 2000 ký tự.'

  return errors
}

function nullable(value: string) {
  return value.trim() || null
}

/** Same body for create and update: PUT /admin/courts/{id} replaces the whole court. */
export function toCourtPayload(values: CourtFormValues): CourtRequest {
  return {
    name: values.name.trim(),
    courtTypeId: Number(values.courtTypeId),
    description: nullable(values.description),
    imageUrl: nullable(values.imageUrl),
    defaultPricePerHour: Number(values.defaultPricePerHour),
    status: values.status,
  }
}

export const COURT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const COURT_IMAGE_MAX_BYTES = 5 * 1024 * 1024

/** Returns an error message when the file cannot be uploaded as a court photo, else null. */
export function validateCourtImageFile(file: File): string | null {
  if (!COURT_IMAGE_TYPES.includes(file.type)) return 'Chỉ nhận ảnh JPEG, PNG hoặc WebP.'
  if (file.size > COURT_IMAGE_MAX_BYTES) return 'Dung lượng ảnh không được vượt quá 5 MB.'
  return null
}
