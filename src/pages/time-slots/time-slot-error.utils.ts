import { isApiError } from '@/common/utils/api-error'
import type { TimeSlotFormErrors } from './time-slot-form.utils'

/** RFC 7807 errors carry no machine code; the HTTP status is the closest equivalent. */
export function getTimeSlotErrorCode(error: unknown) {
  return isApiError(error) ? String(error.status) : undefined
}

export function getTimeSlotErrorMessage(error: unknown) {
  if (isApiError(error)) return error.message
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.'
}

/** Field messages come straight from the `errors[]` array of a 400 problem response. */
export function getTimeSlotFieldErrors(error: unknown): TimeSlotFormErrors {
  if (!isApiError(error)) return {}
  return { ...error.fieldErrors } as TimeSlotFormErrors
}
