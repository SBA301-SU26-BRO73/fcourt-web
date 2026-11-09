import { describe, expect, it } from 'vitest'

import {
  emptyTimeSlotFormValues,
  timeSlotToFormValues,
  toApplyPayload,
  toCreateTimeSlotPayload,
  toUpdateTimeSlotPayload,
  validateTimeSlotForm,
  type TimeSlotFormValues,
} from './time-slot-form.utils'

const valid: TimeSlotFormValues = { ...emptyTimeSlotFormValues, courtId: '7', price: '60000' }

describe('validateTimeSlotForm', () => {
  it('accepts a range over several days and lets the price stay empty', () => {
    expect(validateTimeSlotForm({ ...valid, dayOfWeeks: ['1', '2'], price: '' })).toEqual({})
  })

  it('needs a court, a day and a valid time range', () => {
    const errors = validateTimeSlotForm({ ...valid, courtId: '', dayOfWeeks: [], startTime: '08:00', endTime: '08:00' })
    expect(errors).toMatchObject({ courtId: expect.any(String), dayOfWeeks: expect.any(String), endTime: expect.any(String) })
  })

  it('keeps ranges and starts on the 30-minute grid', () => {
    expect(validateTimeSlotForm({ ...valid, startTime: '06:00', endTime: '06:45' }).endTime).toBeTruthy()
    expect(validateTimeSlotForm({ ...valid, startTime: '06:10', endTime: '07:10' }).startTime).toBeTruthy()
  })

  it('makes a single slot exactly 30 minutes with a price', () => {
    const single = { ...valid, mode: 'single' as const, startTime: '06:00', endTime: '07:00' }
    expect(validateTimeSlotForm(single).endTime).toBeTruthy()
    expect(validateTimeSlotForm({ ...single, endTime: '06:30', price: '' }).price).toBeTruthy()
    expect(validateTimeSlotForm({ ...single, endTime: '06:30' })).toEqual({})
  })

  it('treats editing as a single slot and checks the price format', () => {
    expect(validateTimeSlotForm({ ...valid, startTime: '06:00', endTime: '07:00' }, true).endTime).toBeTruthy()
    expect(validateTimeSlotForm({ ...valid, price: '0' }).price).toBeTruthy()
    expect(validateTimeSlotForm({ ...valid, price: '10.123' }).price).toBeTruthy()
    expect(validateTimeSlotForm({ ...valid, price: '100000000' }).price).toBeTruthy()
  })
})

describe('payload builders', () => {
  it('builds the apply request with sorted days and an optional price', () => {
    expect(toApplyPayload({ ...valid, dayOfWeeks: ['3', '1'], price: '' })).toEqual({
      startTime: '06:00:00',
      endTime: '22:00:00',
      daysOfWeek: [1, 3],
    })
    expect(toApplyPayload(valid).price).toBe(60000)
  })

  it('builds a single-slot create and an update request', () => {
    const single = { ...valid, startTime: '06:00', endTime: '06:30' }
    expect(toCreateTimeSlotPayload(single, 4)).toEqual({ dayOfWeek: 4, startTime: '06:00:00', endTime: '06:30:00', price: 60000 })
    expect(toUpdateTimeSlotPayload({ ...single, dayOfWeeks: ['2'] })).toEqual({
      dayOfWeek: 2,
      startTime: '06:00:00',
      endTime: '06:30:00',
      price: 60000,
    })
  })

  it('fills the form from a template slot', () => {
    const values = timeSlotToFormValues({ id: 1, courtId: 7, dayOfWeek: 5, startTime: '06:00', endTime: '06:30', price: 45000, active: true })
    expect(values).toMatchObject({ courtId: '7', mode: 'single', dayOfWeeks: ['5'], price: '45000' })
  })
})
