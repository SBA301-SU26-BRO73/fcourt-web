import { isApiError } from '@/common/utils/api-error'
import type { ProductFormErrors } from './product-form.utils'

/** RFC 7807 errors carry no machine code; the HTTP status is the closest equivalent. */
export function getProductErrorCode(error: unknown) {
  return isApiError(error) ? String(error.status) : undefined
}

export function getProductErrorMessage(error: unknown) {
  if (isApiError(error)) return error.message
  return error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
}

/** Field messages come straight from the `errors[]` array of a 400 problem response. */
export function getProductFieldErrors(error: unknown): ProductFormErrors {
  if (!isApiError(error)) return {}
  return { ...error.fieldErrors } as ProductFormErrors
}
