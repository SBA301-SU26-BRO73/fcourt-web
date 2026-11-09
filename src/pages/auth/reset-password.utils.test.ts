import { describe, expect, it } from 'vitest'

import { validateNewPassword } from './reset-password.utils'

describe('validateNewPassword', () => {
  it('requires 8 to 72 characters and a matching confirmation', () => {
    expect(validateNewPassword('', '').password).toBeTruthy()
    expect(validateNewPassword('short', 'short').password).toContain('8')
    expect(validateNewPassword('x'.repeat(73), 'x'.repeat(73)).password).toContain('72')
    expect(validateNewPassword('longenough', 'different').confirm).toBeTruthy()
    expect(validateNewPassword('longenough', 'longenough')).toEqual({})
  })
})
