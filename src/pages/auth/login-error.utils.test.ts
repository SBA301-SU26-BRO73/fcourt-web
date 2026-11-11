import { describe, expect, it } from 'vitest'

import { ApiError, toApiError } from '@/common/utils/api-error'
import { getLoginErrorMessage } from './login-error.utils'

function rejectedError(reason?: unknown) {
  return toApiError({
    isAxiosError: true,
    response: {
      status: 403,
      data: { detail: 'Account registration was rejected', reason },
    },
  })
}

describe('getLoginErrorMessage', () => {
  it('preserves the backend reason through HTTP normalization and shows it in Vietnamese', () => {
    const error = rejectedError('  Thiếu giấy phép kinh doanh  ')
    expect(error).toBeInstanceOf(ApiError)
    expect(getLoginErrorMessage(error)).toBe(
      'Tài khoản đăng ký chủ sân đã bị từ chối. Lý do: Thiếu giấy phép kinh doanh',
    )
  })

  it.each([undefined, null, '', '   ', 123, { message: 'invalid' }])(
    'handles a missing, empty or invalid reason (%j)',
    (reason) => {
      expect(getLoginErrorMessage(rejectedError(reason))).toBe('Tài khoản đăng ký chủ sân đã bị từ chối')
    },
  )

  it.each([
    ['Invalid email or password', 'Email hoặc mật khẩu không đúng'],
    ['Account is awaiting approval', 'Tài khoản đang chờ quản trị viên duyệt'],
    ['Account is locked', 'Tài khoản đã bị khóa'],
    ['Account is inactive', 'Tài khoản đã ngừng hoạt động'],
  ])('translates backend auth message %s', (message, translated) => {
    const error = toApiError({ isAxiosError: true, response: { status: 401, data: { detail: message } } })
    expect(getLoginErrorMessage(error)).toBe(translated)
  })

  it('keeps other errors and handles the absence of an error', () => {
    expect(getLoginErrorMessage(new Error('Unknown authentication error'))).toBe('Unknown authentication error')
    expect(getLoginErrorMessage(new Error('toString'))).toBe('toString')
    expect(getLoginErrorMessage(new Error('Account registration was rejected'))).toBe('Tài khoản đăng ký chủ sân đã bị từ chối')
    expect(getLoginErrorMessage(null)).toBeNull()
  })
})
