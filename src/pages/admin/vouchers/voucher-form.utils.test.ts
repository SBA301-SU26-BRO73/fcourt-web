import { describe, expect, it } from 'vitest'

import {
  emptyVoucherFormValues,
  toVoucherRequest,
  validateVoucherForm,
  voucherToFormValues,
  type VoucherFormValues,
} from './voucher-form.utils'

const valid: VoucherFormValues = {
  ...emptyVoucherFormValues(3, new Date('2026-11-09T08:00:00')),
  code: 'summer20',
  discountValue: '20',
  maxDiscountAmount: '50000',
  minOrderAmount: '100000',
  usageLimit: '50',
}

describe('validateVoucherForm', () => {
  it('accepts a complete form', () => {
    expect(validateVoucherForm(valid)).toBeNull()
  })

  it('checks the code pattern and the branch', () => {
    expect(validateVoucherForm({ ...valid, code: '' })).toBeTruthy()
    expect(validateVoucherForm({ ...valid, code: 'bad code!' })).toBeTruthy()
    expect(validateVoucherForm({ ...valid, branchId: 0 })).toBeTruthy()
  })

  it('caps a percentage at 100 but lets a fixed amount go higher', () => {
    expect(validateVoucherForm({ ...valid, discountValue: '101' })).toBeTruthy()
    expect(validateVoucherForm({ ...valid, discountType: 'FIXED_AMOUNT', discountValue: '30000' })).toBeNull()
  })

  it('needs a positive integer usage limit not below the used count', () => {
    expect(validateVoucherForm({ ...valid, usageLimit: '0' })).toBeTruthy()
    expect(validateVoucherForm({ ...valid, usageLimit: '2.5' })).toBeTruthy()
    expect(validateVoucherForm({ ...valid, usageLimit: '3' }, 4)).toBeTruthy()
    expect(validateVoucherForm({ ...valid, usageLimit: '4' }, 4)).toBeNull()
  })

  it('needs the end after the start', () => {
    expect(validateVoucherForm({ ...valid, endDate: valid.startDate })).toBeTruthy()
  })
})

describe('toVoucherRequest', () => {
  it('upper-cases the code, converts local times to ISO instants and maps the switch to status', () => {
    const body = toVoucherRequest({ ...valid, active: false })
    expect(body).toMatchObject({
      code: 'SUMMER20',
      branchId: 3,
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxDiscountAmount: 50000,
      minOrderAmount: 100000,
      usageLimit: 50,
      status: 'EXPIRED',
    })
    expect(body.startDate).toBe(new Date(valid.startDate).toISOString())
  })

  it('drops the cap for a fixed amount and defaults the minimum to 0', () => {
    const body = toVoucherRequest({ ...valid, discountType: 'FIXED_AMOUNT', minOrderAmount: '' })
    expect(body).toMatchObject({ maxDiscountAmount: null, minOrderAmount: 0, status: 'ACTIVE' })
  })
})

describe('voucherToFormValues', () => {
  it('fills the form from a voucher', () => {
    const values = voucherToFormValues({
      id: 1,
      code: 'X',
      branchId: 3,
      discountType: 'FIXED_AMOUNT',
      discountValue: 30000,
      maxDiscountAmount: null,
      minOrderAmount: 0,
      startDate: '2026-11-01T00:00:00Z',
      endDate: '2026-12-01T00:00:00Z',
      usageLimit: 10,
      usedCount: 0,
      status: 'EXPIRED',
    })
    expect(values).toMatchObject({ branchId: 3, discountValue: '30000', minOrderAmount: '', maxDiscountAmount: '', active: false })
  })
})
