import axios from 'axios'

import type { ApiResponse } from '@/types/court'
import type { CourtFormErrors } from './court-form.utils'

type CourtApiErrorData = ApiResponse<Record<string, string>>

export function getCourtErrorCode(error: unknown) {
  if (!axios.isAxiosError<CourtApiErrorData>(error)) return undefined
  return error.response?.data?.errorCode
}

export function getCourtErrorMessage(error: unknown) {
  if (!axios.isAxiosError<CourtApiErrorData>(error)) {
    return error instanceof Error
      ? error.message
      : 'An unexpected error occurred. Please try again.'
  }
  if (!error.response) {
    return 'Cannot connect to the server. Check the backend and try again.'
  }
  return error.response.data?.message || 'The request could not be completed.'
}

export function getCourtFieldErrors(error: unknown): CourtFormErrors {
  if (!axios.isAxiosError<CourtApiErrorData>(error)) return {}
  const response = error.response?.data
  if (!response) return {}

  if (response.errorCode === 'invalid_input' && response.data) {
    return response.data as CourtFormErrors
  }

  const message = response.message?.toLowerCase() ?? ''
  if (message.includes('court name already exists') || message.includes('must not be blank')) {
    return { name: response.message }
  }
  if (message.includes('branch not found')) {
    return { branchId: response.message }
  }
  if (message.includes('court type not found')) {
    return { courtTypeId: response.message }
  }
  return {}
}
