import { describe, expect, it } from 'vitest'

import { parseSlotChange, slotTopic } from './slot-events'

describe('parseSlotChange', () => {
  it('parses an allow-listed event for the subscribed court', () => {
    expect(parseSlotChange('{"courtId":5,"date":"2030-01-01","type":"HOLD_CREATED"}', 5)).toEqual({
      courtId: 5,
      date: '2030-01-01',
      type: 'HOLD_CREATED',
    })
  })

  it('keeps a known lockType only on LOCK_* events', () => {
    expect(
      parseSlotChange('{"courtId":5,"date":"2030-01-01","type":"LOCK_CREATED","lockType":"PRIVATE_EVENT"}', 5),
    ).toMatchObject({ lockType: 'PRIVATE_EVENT' })
    expect(
      parseSlotChange('{"courtId":5,"date":"2030-01-01","type":"HOLD_EXPIRED","lockType":"PRIVATE_EVENT"}', 5),
    ).not.toHaveProperty('lockType')
    expect(
      parseSlotChange('{"courtId":5,"date":"2030-01-01","type":"LOCK_CREATED","lockType":"HACK"}', 5),
    ).not.toHaveProperty('lockType')
  })

  it('degrades an unknown or missing type to SLOT_CHANGED', () => {
    expect(parseSlotChange('{"courtId":5,"date":"2030-01-01","type":"WHATEVER"}', 5)?.type).toBe('SLOT_CHANGED')
    expect(parseSlotChange('{"courtId":5,"date":"2030-01-01"}', 5)?.type).toBe('SLOT_CHANGED')
  })

  it('drops foreign courts, bad dates, malformed and oversized payloads', () => {
    expect(parseSlotChange('{"courtId":6,"date":"2030-01-01"}', 5)).toBeNull()
    expect(parseSlotChange('{"courtId":5,"date":"2030-02-30"}', 5)).toBeNull()
    expect(parseSlotChange('{"courtId":5,"date":"01/01/2030"}', 5)).toBeNull()
    expect(parseSlotChange('not json', 5)).toBeNull()
    expect(parseSlotChange(null, 5)).toBeNull()
    expect(parseSlotChange(`{"courtId":5,"date":"2030-01-01","pad":"${'x'.repeat(1100)}"}`, 5)).toBeNull()
  })

  it('builds the public topic', () => {
    expect(slotTopic(12)).toBe('/topic/court-slots/12')
  })
})
