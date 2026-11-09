import { describe, expect, it } from 'vitest'

import { validators } from './validators'

describe('validators.email', () => {
  it.each([
    'user@example.com',
    'user.name+tag@example.co',
    '  user@example.com  ',
  ])('accepts valid email "%s"', (email) => {
    expect(validators.email(email)).toBe(true)
  })

  it.each([
    '',
    'plain-address',
    'missing-at.example.com',
    'missing-domain@',
    '@missing-local.com',
    'has space@example.com',
    'user@example',
  ])('rejects invalid email "%s"', (email) => {
    expect(validators.email(email)).toBe(false)
  })
})

describe('validators.phone', () => {
  it.each(['0912345678', '+84912345678', '091 234 5678', '091.234.5678'])(
    'accepts valid phone "%s"',
    (phone) => {
      expect(validators.phone(phone)).toBe(true)
    },
  )

  it.each(['', '1912345678', '+84123', '091-234-5678', 'phone'])('rejects invalid phone "%s"', (phone) => {
    expect(validators.phone(phone)).toBe(false)
  })
})

describe('validators.passwordStrength', () => {
  it.each([
    ['', 0],
    ['abcdef', 1],
    ['abcdefghij', 2],
    ['Abcdefghij', 3],
    ['Abcdefghij1!', 4],
  ] as const)('returns score %s for "%s"', (password, score) => {
    expect(validators.passwordStrength(password)).toBe(score)
  })
})

describe("validators.vnMobile", () => {
  it("matches the booking services phone pattern", () => {
    expect(validators.vnMobile("0912345678")).toBe(true)
    expect(validators.vnMobile(" 0387654321 ")).toBe(true)
    expect(validators.vnMobile("0212345678")).toBe(false)
    expect(validators.vnMobile("091234567")).toBe(false)
    expect(validators.vnMobile("+84912345678")).toBe(false)
  })
})
