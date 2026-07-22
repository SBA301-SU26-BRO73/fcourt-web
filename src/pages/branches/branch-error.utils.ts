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
      : 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.'
  }

  if (!error.response) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend và thử lại.'
  }

  return error.response.data?.message || 'Không thể hoàn tất yêu cầu.'
}

export function getBranchFieldErrors(error: unknown): BranchFormErrors {
  if (!axios.isAxiosError<BranchApiErrorData>(error)) return {}

  const response = error.response?.data
  if (!response) return {}

  if (response.errorCode === 'branch_name_already_exists') {
    return { name: 'Tên chi nhánh đã tồn tại.' }
  }

  if (response.errorCode === 'invalid_input' && response.data) {
    const fieldMessages: BranchFormErrors = {}
    for (const field of Object.keys(response.data) as Array<keyof BranchFormErrors>) {
      const labels: Partial<Record<keyof BranchFormErrors, string>> = {
        name: 'Tên chi nhánh', address: 'Địa chỉ', ward: 'Phường/Xã', city: 'Tỉnh/Thành phố',
        openTime: 'Giờ mở cửa', closeTime: 'Giờ đóng cửa', slotDurationMinutes: 'Thời lượng khung giờ',
      }
      fieldMessages[field] = `${labels[field] ?? 'Thông tin này'} không hợp lệ.`
    }
    return fieldMessages
  }

  return {}
}
