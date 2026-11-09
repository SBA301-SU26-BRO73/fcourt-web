import { describe, expect, it } from 'vitest'

import {
  emptyCourtLockFormValues,
  toBranchLockRequest,
  toInputDateTime,
  toLockSlotsRequest,
  validateCourtLockForm,
  type CourtLockFormValues,
} from './court-lock-form.utils'

const now = new Date('2026-11-09T08:00:00')
const valid: CourtLockFormValues = {
  ...emptyCourtLockFormValues('3'),
  courtId: '12',
  startAt: '2026-11-10T08:00',
  endAt: '2026-11-10T10:30',
  reason: 'Sơn lại sân',
}

describe('validateCourtLockForm', () => {
  it('accepts a complete single-court lock', () => {
    expect(validateCourtLockForm(valid, now)).toEqual({})
  })

  it('needs a court for the court scope and a list for the courts scope', () => {
    expect(validateCourtLockForm({ ...valid, courtId: '' }, now).courtId).toBeTruthy()
    expect(validateCourtLockForm({ ...valid, scope: 'courts' }, now).courtIds).toBeTruthy()
    expect(validateCourtLockForm({ ...valid, scope: 'branch', courtId: '' }, now)).toEqual({})
  })

  it('keeps the window on the 30-minute grid, in the future and at most 31 days', () => {
    expect(validateCourtLockForm({ ...valid, startAt: '2026-11-10T08:15' }, now).startAt).toBeTruthy()
    expect(validateCourtLockForm({ ...valid, endAt: '2026-11-10T08:00' }, now).endAt).toBeTruthy()
    expect(validateCourtLockForm({ ...valid, startAt: '2026-11-01T08:00', endAt: '2026-11-02T08:00' }, now).endAt).toBeTruthy()
    expect(validateCourtLockForm({ ...valid, endAt: '2026-12-20T08:00' }, now).endAt).toBeTruthy()
  })

  it('requires a reason and checks the contact phone', () => {
    expect(validateCourtLockForm({ ...valid, reason: '  ' }, now).reason).toBeTruthy()
    expect(validateCourtLockForm({ ...valid, contactPhone: '12ab' }, now).contactPhone).toBeTruthy()
    expect(validateCourtLockForm({ ...valid, contactPhone: '+84901234567' }, now)).toEqual({})
  })
})

describe('request mapping', () => {
  it('builds a single-court request and drops empty optional fields', () => {
    expect(toLockSlotsRequest({ ...valid, publicReason: ' Bảo trì ' })).toEqual({
      courtId: 12,
      startAt: '2026-11-10T08:00:00',
      endAt: '2026-11-10T10:30:00',
      type: 'OUT_OF_SERVICE',
      reason: 'Sơn lại sân',
      publicReason: 'Bảo trì',
    })
  })

  it('builds the branch request for all courts or for a list', () => {
    expect(toBranchLockRequest({ ...valid, scope: 'branch' })).toMatchObject({ branchId: 3, allCourts: true })
    const listed = toBranchLockRequest({ ...valid, scope: 'courts', courtIds: ['5', '6'], type: 'PRIVATE_EVENT' })
    expect(listed).toMatchObject({ branchId: 3, courtIds: [5, 6], type: 'PRIVATE_EVENT' })
    expect(listed).not.toHaveProperty('allCourts')
  })

  it('cuts seconds for the datetime-local input', () => {
    expect(toInputDateTime('2026-11-10T08:00:00')).toBe('2026-11-10T08:00')
  })
})
