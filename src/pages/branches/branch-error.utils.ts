import { isApiError } from '@/common/utils/api-error'
import type { BranchFormErrors } from './branch-form.utils'

/** RFC 7807 errors carry no machine code; the HTTP status is the closest equivalent. */
export function getBranchErrorCode(error: unknown) {
  return isApiError(error) ? String(error.status) : undefined
}

export function getBranchErrorMessage(error: unknown) {
  if (isApiError(error)) return error.message
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.'
}

/** Field messages come straight from the `errors[]` array of a 400 problem response. */
export function getBranchFieldErrors(error: unknown): BranchFormErrors {
  if (!isApiError(error)) return {}
  return { ...error.fieldErrors } as BranchFormErrors
}
