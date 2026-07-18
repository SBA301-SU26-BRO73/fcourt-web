import axios from 'axios'

import type { ApiResponse } from '@/types/branch'
import type { BranchFormErrors } from './branch-form.utils'

type BranchApiErrorData = ApiResponse<Record<string, string>>

export function getBranchErrorCode(error: unknown) {
  if (!axios.isAxiosError<BranchApiErrorData>(error)) return undefined
  return error.response?.data?.errorCode
}

export function getBranchErrorMessage(error: unknown) {
  if (!axios.isAxiosError<BranchApiErrorData>(error)) {
    return error instanceof Error
      ? error.message
      : 'An unexpected error occurred. Please try again.'
  }

  if (!error.response) {
    return 'Cannot connect to the server. Check the backend and try again.'
  }

  return error.response.data?.message || 'The request could not be completed.'
}

export function getBranchFieldErrors(error: unknown): BranchFormErrors {
  if (!axios.isAxiosError<BranchApiErrorData>(error)) return {}

  const response = error.response?.data
  if (!response) return {}

  if (response.errorCode === 'branch_name_already_exists') {
    return { name: 'Branch name already exists.' }
  }

  if (response.errorCode === 'invalid_input' && response.data) {
    return response.data as BranchFormErrors
  }

  return {}
}
