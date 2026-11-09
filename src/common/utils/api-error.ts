import { isAxiosError } from 'axios'
import { toast } from 'sonner'

/** RFC 7807 `application/problem+json` body as sent by the FCOURT services. */
export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  errors?: Array<{ field?: string; message?: string }>
}

const NETWORK_MESSAGE = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.'

/**
 * The single error type the HTTP layer rejects with. `message` is always safe to
 * show to the user: it is `detail`, falling back to `title`, then a generic text.
 */
export class ApiError extends Error {
  readonly status: number
  readonly title?: string
  readonly detail?: string
  /** field name -> message, from the `errors[]` array of validation problems. */
  readonly fieldErrors: Record<string, string>
  readonly isNetworkError: boolean

  constructor(init: {
    status: number
    message: string
    title?: string
    detail?: string
    fieldErrors?: Record<string, string>
    isNetworkError?: boolean
    cause?: unknown
  }) {
    super(init.message, { cause: init.cause })
    this.name = 'ApiError'
    this.status = init.status
    this.title = init.title
    this.detail = init.detail
    this.fieldErrors = init.fieldErrors ?? {}
    this.isNetworkError = init.isNetworkError ?? false
  }
}

function asProblem(data: unknown): ProblemDetails {
  return data && typeof data === 'object' ? (data as ProblemDetails) : {}
}

/** Convert anything thrown by axios into an {@link ApiError}; other errors pass through. */
export function toApiError(error: unknown): unknown {
  if (error instanceof ApiError) return error
  if (!isAxiosError(error)) return error

  if (!error.response) {
    return new ApiError({
      status: 0,
      message: NETWORK_MESSAGE,
      isNetworkError: true,
      cause: error,
    })
  }

  const { status, data } = error.response
  const problem = asProblem(data)
  const fieldErrors: Record<string, string> = {}
  if (Array.isArray(problem.errors)) {
    for (const item of problem.errors) {
      if (item?.field && item.message && !(item.field in fieldErrors)) {
        fieldErrors[item.field] = item.message
      }
    }
  }
  const detail = typeof problem.detail === 'string' ? problem.detail.trim() : undefined
  const title = typeof problem.title === 'string' ? problem.title.trim() : undefined

  return new ApiError({
    status: problem.status ?? status,
    message: detail || title || `Yêu cầu thất bại (${status}).`,
    title,
    detail,
    fieldErrors,
    cause: error,
  })
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** Human-readable message for any thrown value. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  const converted = toApiError(error)
  if (converted instanceof Error && converted.message) return converted.message
  return fallback
}

/** Show an error through the app toast (sonner). */
export function toastApiError(error: unknown, fallback?: string) {
  toast.error(getApiErrorMessage(error, fallback))
}
