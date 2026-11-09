import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { holdSlots, releaseHold } from '@/services/hold/hold.api'
import { loadActiveHold } from '@/utils/hold-storage'

import { useSlotHold, type StartHoldInput } from './use-slot-hold'

vi.mock('@/services/hold/hold.api', () => ({ holdSlots: vi.fn(), releaseHold: vi.fn() }))

const input: StartHoldInput = {
  courtId: 1,
  courtName: 'Sân 1',
  branchId: 2,
  branchName: 'CN',
  date: '2030-01-01',
  guestPhone: '0912345678',
  slots: [{ slotId: 9, startTime: '06:00', endTime: '06:30', price: 50000 }],
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2030-01-01T00:00:00Z'))
  sessionStorage.clear()
  vi.mocked(holdSlots).mockReset()
  vi.mocked(releaseHold).mockReset()
})
afterEach(() => vi.useRealTimers())

describe('useSlotHold', () => {
  it('omits the phone when a signed-in customer holds without one', async () => {
    vi.mocked(holdSlots).mockResolvedValue({ holdToken: 'tok', expiresAt: Date.now() + 300_000, response: {} as never })
    const { result } = renderHook(() => useSlotHold())
    await act(async () => {
      await result.current.start({ ...input, guestPhone: '' })
    })
    expect(holdSlots).toHaveBeenCalledWith({ courtId: 1, date: '2030-01-01', slotIds: [9], guestPhone: undefined })
  })

  it('holds, counts down from the server expiry and expires exactly once', async () => {
    const expiresAt = Date.now() + 300_000
    vi.mocked(holdSlots).mockResolvedValue({ holdToken: 'tok', expiresAt, response: {} as never })
    const onExpired = vi.fn()
    const { result } = renderHook(() => useSlotHold({ onExpired }))

    await act(async () => {
      await result.current.start(input)
    })
    expect(holdSlots).toHaveBeenCalledWith({ courtId: 1, date: '2030-01-01', slotIds: [9], guestPhone: '0912345678' })
    expect(result.current.status).toBe('active')
    expect(result.current.remaining).toBe(300)
    expect(loadActiveHold()?.holdToken).toBe('tok')

    act(() => {
      vi.advanceTimersByTime(245_000)
    })
    expect(result.current.remaining).toBe(55)
    expect(result.current.isWarning).toBe(true)
    expect(onExpired).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(result.current.status).toBe('expired')
    expect(result.current.hold).toBeNull()
    expect(onExpired).toHaveBeenCalledTimes(1)
    expect(loadActiveHold()).toBeNull()
  })

  it('goes back to idle and rethrows when the hold is rejected', async () => {
    vi.mocked(holdSlots).mockRejectedValue(new Error('409'))
    const { result } = renderHook(() => useSlotHold())
    await act(async () => {
      await expect(result.current.start(input)).rejects.toThrow('409')
    })
    expect(result.current.status).toBe('idle')
  })

  it('release drops the hold locally and calls DELETE with the token', async () => {
    vi.mocked(holdSlots).mockResolvedValue({ holdToken: 'tok', expiresAt: Date.now() + 300_000, response: {} as never })
    vi.mocked(releaseHold).mockResolvedValue(undefined)
    const { result } = renderHook(() => useSlotHold())
    await act(async () => {
      await result.current.start(input)
    })
    await act(async () => {
      await result.current.release()
    })
    expect(releaseHold).toHaveBeenCalledWith('tok')
    expect(result.current.status).toBe('idle')
    expect(loadActiveHold()).toBeNull()
  })

  it('restores a stored hold after a reload without restarting the countdown', () => {
    sessionStorage.setItem(
      'fcourt.activeHold',
      JSON.stringify({ ...input, holdToken: 'tok', expiresAt: Date.now() + 90_000 }),
    )
    const { result } = renderHook(() => useSlotHold())
    expect(result.current.status).toBe('active')
    expect(result.current.remaining).toBe(90)
  })
})
