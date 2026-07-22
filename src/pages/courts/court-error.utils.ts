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
      : 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.'
  }
  if (!error.response) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend và thử lại.'
  }
  return error.response.data?.message || 'Không thể hoàn tất yêu cầu.'
}

export function getCourtFieldErrors(error: unknown): CourtFormErrors {
  if (!axios.isAxiosError<CourtApiErrorData>(error)) return {}
  const response = error.response?.data
  if (!response) return {}

  if (response.errorCode === 'invalid_input' && response.data) {
    const fieldMessages: CourtFormErrors = {}
    for (const field of Object.keys(response.data) as Array<keyof CourtFormErrors>) {
      const labels: Partial<Record<keyof CourtFormErrors, string>> = {
        branchId: 'Chi nhánh', name: 'Tên sân', courtTypeId: 'Loại sân', description: 'Mô tả', imageUrl: 'Ảnh sân', status: 'Trạng thái',
      }
      fieldMessages[field] = `${labels[field] ?? 'Thông tin này'} không hợp lệ.`
    }
    return fieldMessages
  }

  const message = response.message?.toLowerCase() ?? ''
  if (message.includes('court name already exists') || message.includes('must not be blank')) {
    return { name: 'Tên sân đã tồn tại hoặc chưa được nhập.' }
  }
  if (message.includes('branch not found')) {
    return { branchId: 'Không tìm thấy chi nhánh đã chọn.' }
  }
  if (message.includes('court type not found')) {
    return { courtTypeId: 'Không tìm thấy loại sân đã chọn.' }
  }
  return {}
}
