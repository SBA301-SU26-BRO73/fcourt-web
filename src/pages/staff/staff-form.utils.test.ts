import { describe, expect, it } from 'vitest'

import type { StaffResponse } from '@/types/staff'

import {
  emptyStaffFormValues,
  staffToFormValues,
  toCreateStaffRequest,
  toUpdateStaffRequest,
  validateShifts,
  validateStaffForm,
  type StaffFormValues,
} from './staff-form.utils'

const valid: StaffFormValues = {
  email: 'an@bro73.app',
  password: 'a-long-password-1',
  fullName: ' Nguyen An ',
  phone: '0901234567',
  shifts: [{ dayOfWeek: 1, startTime: '08:00', endTime: '12:00' }],
}

describe('validateStaffForm', () => {
  it('accepts a complete create form', () => {
    expect(validateStaffForm(valid, false)).toEqual({})
  })

  it('needs a 12 character password only when creating', () => {
    expect(validateStaffForm({ ...valid, password: 'short' }, false).password).toBeTruthy()
    expect(validateStaffForm({ ...valid, email: '', password: '' }, true)).toEqual({})
  })

  it('checks email, name and phone', () => {
    const errors = validateStaffForm({ ...valid, email: 'nope', fullName: ' ', phone: '123' }, false)
    expect(Object.keys(errors).sort()).toEqual(['email', 'fullName', 'phone'])
    expect(validateStaffForm({ ...valid, phone: '+84901234567' }, false).phone).toBeUndefined()
  })
})

describe('validateShifts', () => {
  it('allows no shift and adjacent shifts', () => {
    expect(validateShifts([])).toBeNull()
    expect(
      validateShifts([
        { dayOfWeek: 2, startTime: '08:00', endTime: '12:00' },
        { dayOfWeek: 2, startTime: '12:00', endTime: '17:00' },
      ]),
    ).toBeNull()
  })

  it('rejects an end not after the start and overlapping shifts on one day', () => {
    expect(validateShifts([{ dayOfWeek: 1, startTime: '10:00', endTime: '10:00' }])).toBeTruthy()
    expect(
      validateShifts([
        { dayOfWeek: 3, startTime: '08:00', endTime: '12:00' },
        { dayOfWeek: 3, startTime: '11:00', endTime: '15:00' },
      ]),
    ).toBeTruthy()
  })

  it('lets the same hours on different days through and caps the count', () => {
    expect(
      validateShifts([
        { dayOfWeek: 1, startTime: '08:00', endTime: '12:00' },
        { dayOfWeek: 2, startTime: '08:00', endTime: '12:00' },
      ]),
    ).toBeNull()
    const many = Array.from({ length: 29 }, () => ({ dayOfWeek: 1, startTime: '08:00', endTime: '09:00' }))
    expect(validateShifts(many)).toBeTruthy()
  })
})

describe('request builders', () => {
  it('trims text and sends the branch on create', () => {
    expect(toCreateStaffRequest(valid, 7)).toEqual({
      branchId: 7,
      email: 'an@bro73.app',
      password: 'a-long-password-1',
      fullName: 'Nguyen An',
      phone: '0901234567',
      shifts: valid.shifts,
    })
  })

  it('leaves email, password and branch out of an update', () => {
    expect(toUpdateStaffRequest(valid)).toEqual({
      fullName: 'Nguyen An',
      phone: '0901234567',
      shifts: valid.shifts,
    })
  })

  it('reads a staff view back into the form with minute precision', () => {
    const staff: StaffResponse = {
      id: 1,
      userId: 9,
      branchId: 7,
      email: 'an@bro73.app',
      fullName: 'Nguyen An',
      phone: null,
      active: true,
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
      shifts: [{ dayOfWeek: 5, startTime: '08:00:00', endTime: '12:30:00' }],
    }
    expect(staffToFormValues(staff)).toEqual({
      ...emptyStaffFormValues,
      email: 'an@bro73.app',
      fullName: 'Nguyen An',
      shifts: [{ dayOfWeek: 5, startTime: '08:00', endTime: '12:30' }],
    })
  })
})
