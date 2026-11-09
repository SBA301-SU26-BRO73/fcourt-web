/** Matches the backend rule for `newPassword` (8 to 72 characters). */
const RESET_PASSWORD_MIN = 8
const RESET_PASSWORD_MAX = 72

export function validateNewPassword(password: string, confirm: string) {
  const errors: Record<string, string> = {}
  if (!password) errors.password = 'Vui lòng nhập mật khẩu mới'
  else if (password.length < RESET_PASSWORD_MIN) errors.password = `Mật khẩu tối thiểu ${RESET_PASSWORD_MIN} ký tự`
  else if (password.length > RESET_PASSWORD_MAX) errors.password = `Mật khẩu tối đa ${RESET_PASSWORD_MAX} ký tự`
  if (password !== confirm) errors.confirm = 'Mật khẩu xác nhận không khớp'
  return errors
}
