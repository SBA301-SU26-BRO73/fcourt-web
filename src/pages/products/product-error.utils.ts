import axios from 'axios'

import type { ApiResponse } from '@/types/court'
import type { ProductFormErrors } from './product-form.utils'

type ProductApiErrorData = ApiResponse<Record<string, string>>

export function getProductErrorCode(error: unknown) {
  if (!axios.isAxiosError<ProductApiErrorData>(error)) return undefined
  return error.response?.data?.errorCode
}

export function getProductErrorMessage(error: unknown) {
  if (!axios.isAxiosError<ProductApiErrorData>(error)) {
    return error instanceof Error
      ? error.message
      : 'An unexpected error occurred. Please try again.'
  }
  if (!error.response) {
    return 'Cannot connect to the server. Check the backend and try again.'
  }
  return error.response.data?.message || 'The request could not be completed.'
}

export function getProductFieldErrors(error: unknown): ProductFormErrors {
  if (!axios.isAxiosError<ProductApiErrorData>(error)) return {}
  const response = error.response?.data
  if (!response) return {}

  if (response.errorCode === 'invalid_input' && response.data) {
    return response.data as ProductFormErrors
  }

  const message = response.message?.toLowerCase() ?? ''
  if (message.includes('product name') || message.includes('must not be blank')) {
    return { name: response.message }
  }
  if (message.includes('price')) {
    return { price: response.message }
  }
  if (message.includes('branch not found')) {
    return { branchId: response.message }
  }
  return {}
}
