import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { CourtSlot } from '@/types/public-branch'
import CourtAvailabilityGrid from './court-availability-grid'

afterEach(cleanup)

const courts = [{ id: 1, name: 'Sân 1', type: 'Cầu lông' }, { id: 2, name: 'Sân 2', type: 'Cầu lông' }]
const times = ['06:00', '09:00', '10:30', '18:00']
const props = {
  selectedDate: '2030-01-01', onDateChange: vi.fn(), selectedSlots: [], onSlotClick: vi.fn(),
  courts, timeSlots: times,
}
const nonPeakSchedules: Record<number, CourtSlot[]>[] = [
  {}, { 1: [] }, { 1: [slot('09:00', 90000), slot('10:30', 90000)] },
]

function slot(startTime: string, price: number, slotId = 1): CourtSlot {
  return { slotId, startTime: `${startTime}:00`, endTime: '19:00:00', price, status: 'AVAILABLE' }
}

describe('CourtAvailabilityGrid peak labels', () => {
  it('labels only times with a price above the daily minimum, including outside the old peak hours', () => {
    render(<CourtAvailabilityGrid {...props} courtSchedules={{ 1: [
      slot('06:00', 50000), slot('09:00', 50000, 2), slot('10:30', 60000, 3), slot('18:00', 90000, 4),
    ] }} />)

    expect(screen.getAllByText('CAO ĐIỂM')).toHaveLength(2)
    for (const time of ['06:00', '09:00']) {
      expect(screen.getByText(time).parentElement?.textContent).not.toContain('CAO ĐIỂM')
    }
    for (const time of ['10:30', '18:00']) {
      expect(screen.getByText(time).parentElement?.textContent).toContain('CAO ĐIỂM')
    }
  })

  it('compares prices across courts and handles a zero daily minimum', () => {
    render(<CourtAvailabilityGrid {...props} courtSchedules={{
      1: [slot('06:00', 0)], 2: [slot('18:00', 50000)],
    }} />)
    expect(screen.getAllByText('CAO ĐIỂM')).toHaveLength(1)
    expect(screen.getByText('18:00').parentElement?.textContent).toContain('CAO ĐIỂM')
    expect(screen.getByText('09:00').parentElement?.textContent).not.toContain('CAO ĐIỂM')
  })

  it.each(nonPeakSchedules)(
    'shows no peak labels for empty schedules or equal prices: %j', (courtSchedules) => {
      render(<CourtAvailabilityGrid {...props} courtSchedules={courtSchedules} />)
      expect(screen.queryByText('CAO ĐIỂM')).toBeNull()
    },
  )

  it('recalculates labels when the selected day and its schedule change', () => {
    const { rerender } = render(<CourtAvailabilityGrid {...props} courtSchedules={{
      1: [slot('09:00', 50000), slot('18:00', 90000)],
    }} />)
    expect(screen.getByText('18:00').parentElement?.textContent).toContain('CAO ĐIỂM')
    rerender(<CourtAvailabilityGrid {...props} selectedDate="2030-01-02" courtSchedules={{
      1: [slot('09:00', 90000), slot('18:00', 90000)],
    }} />)
    expect(screen.queryByText('CAO ĐIỂM')).toBeNull()
  })
})
