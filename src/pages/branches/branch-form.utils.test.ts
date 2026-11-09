import { describe, expect, it } from 'vitest'

import {
  GALLERY_MAX_IMAGES,
  emptyBranchFormValues,
  toBranchPayload,
  validateBranchForm,
  validateGalleryFiles,
  type BranchFormValues,
} from './branch-form.utils'

const valid: BranchFormValues = {
  ...emptyBranchFormValues,
  name: 'Cơ sở A',
  address: '1 Láng Hạ',
  city: 'Hà Nội',
  district: 'Đống Đa',
  ward: 'Láng Hạ',
  bankName: 'Vietcombank',
  bankBin: '970436',
  bankAccountNumber: '0123456789',
  bankAccountName: 'NGUYEN VAN A',
}

const image = (type: string, size = 10) => ({ type, size }) as File

describe('validateBranchForm', () => {
  it('accepts a complete form', () => {
    expect(validateBranchForm(valid)).toEqual({})
  })

  it('requires the bank fields the backend now demands', () => {
    const errors = validateBranchForm({ ...valid, bankName: '', bankBin: '', bankAccountNumber: '', bankAccountName: '' })
    expect(Object.keys(errors).sort()).toEqual(['bankAccountName', 'bankAccountNumber', 'bankBin', 'bankName'])
  })

  it('checks the BIN, account number and phone patterns', () => {
    const errors = validateBranchForm({ ...valid, bankBin: '12345', bankAccountNumber: '12ab', phone: 'abc' })
    expect(errors.bankBin).toBeTruthy()
    expect(errors.bankAccountNumber).toBeTruthy()
    expect(errors.phone).toBeTruthy()
  })

  it('rejects a closing time that is not after opening time', () => {
    expect(validateBranchForm({ ...valid, openTime: '10:00', closeTime: '10:00' }).closeTime).toBeTruthy()
  })
})

describe('toBranchPayload', () => {
  it('builds the BranchRequest and keeps stored coordinates on edit', () => {
    const payload = toBranchPayload({ ...valid, phone: ' ', slotDurationMinutes: '60', status: 'INACTIVE' }, { latitude: 21, longitude: 105 })
    expect(payload).toMatchObject({
      district: 'Đống Đa',
      phone: null,
      openTime: '06:00',
      slotDurationMinutes: 60,
      bankBin: '970436',
      latitude: 21,
      longitude: 105,
      status: 'INACTIVE',
    })
    expect(payload).not.toHaveProperty('adminId')
  })
})

describe('validateGalleryFiles', () => {
  it('accepts JPEG, PNG and WebP within limits', () => {
    expect(validateGalleryFiles(0, [], [image('image/jpeg'), image('image/webp')])).toBeNull()
  })

  it('rejects other types and oversized files', () => {
    expect(validateGalleryFiles(0, [], [image('image/gif')])).toBeTruthy()
    expect(validateGalleryFiles(0, [], [image('image/png', 5 * 1024 * 1024 + 1)])).toBeTruthy()
  })

  it('caps the gallery at the backend limit counting saved and staged files', () => {
    const staged = [image('image/png')]
    expect(validateGalleryFiles(GALLERY_MAX_IMAGES - 2, staged, [image('image/png')])).toBeNull()
    expect(validateGalleryFiles(GALLERY_MAX_IMAGES - 1, staged, [image('image/png')])).toBeTruthy()
  })
})
