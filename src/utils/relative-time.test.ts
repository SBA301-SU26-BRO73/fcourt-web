import { describe, expect, it } from 'vitest'

import { formatRelativeTime } from './relative-time'

const NOW = Date.parse('2026-11-11T12:00:00Z')

function ago(seconds: number) {
  return new Date(NOW - seconds * 1000).toISOString()
}

describe('formatRelativeTime', () => {
  it('says "Vừa xong" below a minute, also for a clock a little ahead of the server', () => {
    expect(formatRelativeTime(ago(5), NOW)).toBe('Vừa xong')
    expect(formatRelativeTime(ago(-30), NOW)).toBe('Vừa xong')
  })

  it('counts minutes, hours and days', () => {
    expect(formatRelativeTime(ago(60), NOW)).toBe('1 phút trước')
    expect(formatRelativeTime(ago(59 * 60), NOW)).toBe('59 phút trước')
    expect(formatRelativeTime(ago(3 * 3600), NOW)).toBe('3 giờ trước')
    expect(formatRelativeTime(ago(2 * 86400), NOW)).toBe('2 ngày trước')
  })

  it('falls back to the date after a week and to nothing for garbage', () => {
    expect(formatRelativeTime('2026-11-01T05:00:00Z', NOW)).toMatch(/^\d{2}\/11\/2026$/)
    expect(formatRelativeTime('not a date', NOW)).toBe('')
  })
})
