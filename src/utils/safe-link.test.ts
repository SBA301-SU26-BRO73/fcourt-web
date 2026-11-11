import { describe, expect, it } from 'vitest'

import { safeInternalLink } from './safe-link'

describe('safeInternalLink', () => {
  it('only lets app routes through', () => {
    expect(safeInternalLink('/my-bookings')).toBe('/my-bookings')
    expect(safeInternalLink('https://evil.example')).toBeNull()
    expect(safeInternalLink('//evil.example')).toBeNull()
    expect(safeInternalLink(null)).toBeNull()
  })
})
