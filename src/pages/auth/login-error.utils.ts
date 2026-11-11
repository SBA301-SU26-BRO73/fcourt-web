import { isApiError, toApiError } from '@/common/utils/api-error'

const AUTH_MESSAGES: Record<string, string> = {
  'Invalid email or password': 'Email hoặc mật khẩu không đúng',
  'Account is awaiting approval': 'Tài khoản đang chờ quản trị viên duyệt',
  'Account is locked': 'Tài khoản đã bị khóa',
  'Account is inactive': 'Tài khoản đã ngừng hoạt động',
}

export function getLoginErrorMessage(error: unknown): string | null {
  const converted = toApiError(error)
  if (!(converted instanceof Error)) return null

  if (/^Account registration was rejected[.!]?$/i.test(converted.message.trim())) {
    const message = 'Tài khoản đăng ký chủ sân đã bị từ chối'
    const reason = isApiError(converted) && typeof converted.reason === 'string' ? converted.reason.trim() : ''
    return reason ? `${message}. Lý do: ${reason}` : message
  }

  return Object.hasOwn(AUTH_MESSAGES, converted.message) ? AUTH_MESSAGES[converted.message] : converted.message
}
