import { AxiosError } from 'axios'

/**
 * Pull a human-readable message out of an API error.
 *
 * The success interceptor unwraps `data`, but error responses reject with the
 * raw ApiResponse envelope `{ httpStatus, errorCode, message, data }`, so the
 * message lives at `error.response.data.message`.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof AxiosError) {
    const envelope = error.response?.data as { message?: string } | undefined
    if (envelope?.message) return envelope.message
    if (error.message) return error.message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
