import axios from 'axios'

import type { ApiResponse } from '@/types/time-slot-template'
import type { TimeSlotFormErrors } from './time-slot-form.utils'

type TimeSlotApiError = ApiResponse<Record<string, string>>

export function getTimeSlotErrorCode(error: unknown) {
  if (!axios.isAxiosError<TimeSlotApiError>(error)) return undefined
  return error.response?.data?.errorCode
}

export function getTimeSlotErrorMessage(error: unknown) {
  if (!axios.isAxiosError<TimeSlotApiError>(error)) {
    return error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.'
  }
  if (!error.response) return 'Không thể kết nối tới server. Hãy kiểm tra backend.'
  return error.response.data?.message || 'Không thể hoàn thành yêu cầu.'
}

export function getTimeSlotFieldErrors(error: unknown): TimeSlotFormErrors {
  if (!axios.isAxiosError<TimeSlotApiError>(error)) return {}
  const response = error.response?.data
  if (!response) return {}
  if (response.errorCode === 'invalid_input' && response.data) {
    return response.data as TimeSlotFormErrors
  }

  const message = response.message?.toLowerCase() ?? ''
  if (message.includes('day of week')) return { dayOfWeek: response.message }
  if (message.includes('start time')) return { endTime: response.message }
  if (message.includes('price')) return { price: response.message }
  if (message.includes('already exists')) {
    return { startTime: response.message, endTime: response.message }
  }
  if (message.includes('court not found')) return { courtId: response.message }
  return {}
}
