import { describe, expect, it, vi } from 'vitest'

import type { OfflineSnapshot, PendingOfflineCheckIn } from '@/types/counter'

import { hashCheckInCode, matchOfflineTicket, syncQueue } from './offline-checkin'

const snapshot: OfflineSnapshot = {
  userId: 5,
  branchId: 1,
  date: '2026-11-09',
  generatedAt: '2026-11-09T01:00:00Z',
  tickets: [
    {
      bookingId: 10,
      codeHash: 'hash-10',
      courtName: 'Court 1',
      customerName: 'An',
      validFrom: '2026-11-09T02:45:00Z',
      validUntil: '2026-11-09T04:00:00Z',
      permit: 'permit-10',
    },
  ],
}

function entry(bookingId: number): PendingOfflineCheckIn {
  return {
    idempotencyKey: `key-${bookingId}`,
    bookingId,
    courtName: 'Court 1',
    customerName: null,
    permit: `permit-${bookingId}`,
    occurredAt: '2026-11-09T03:00:00Z',
  }
}

describe('hashCheckInCode', () => {
  it('is the SHA-256 hex of the trimmed code', async () => {
    expect(await hashCheckInCode(' abc ')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })
})

describe('matchOfflineTicket', () => {
  const inWindow = new Date('2026-11-09T03:00:00Z')

  it('accepts a known code inside its permit window', () => {
    const match = matchOfflineTicket('hash-10', snapshot, [], inWindow)
    expect(match).toMatchObject({ ok: true, ticket: { bookingId: 10 } })
  })

  it('refuses without a snapshot, an unknown code, or outside the window', () => {
    expect(matchOfflineTicket('hash-10', null, [], inWindow)).toEqual({ ok: false, reason: 'NO_SNAPSHOT' })
    expect(matchOfflineTicket('nope', snapshot, [], inWindow)).toEqual({ ok: false, reason: 'UNKNOWN_CODE' })
    expect(matchOfflineTicket('hash-10', snapshot, [], new Date('2026-11-09T02:00:00Z'))).toEqual({
      ok: false,
      reason: 'NOT_YET_VALID',
    })
    expect(matchOfflineTicket('hash-10', snapshot, [], new Date('2026-11-09T04:00:00Z'))).toEqual({
      ok: false,
      reason: 'EXPIRED',
    })
  })

  it('refuses a ticket that is already queued', () => {
    expect(matchOfflineTicket('hash-10', snapshot, [entry(10)], inWindow)).toEqual({
      ok: false,
      reason: 'ALREADY_QUEUED',
    })
  })
})

describe('syncQueue', () => {
  const final = (e: unknown) => e === 'final'

  it('replays everything in order', async () => {
    const replay = vi.fn().mockResolvedValue({})
    const outcome = await syncQueue([entry(1), entry(2)], replay, final, String)
    expect(outcome).toMatchObject({ synced: 2, rejected: [], remaining: [] })
    expect(replay.mock.calls.map((c) => c[0].bookingId)).toEqual([1, 2])
  })

  it('drops an entry the server refused and keeps going', async () => {
    const replay = vi.fn().mockRejectedValueOnce('final').mockResolvedValueOnce({})
    const outcome = await syncQueue([entry(1), entry(2)], replay, final, () => 'refused')
    expect(outcome.synced).toBe(1)
    expect(outcome.rejected).toEqual([{ entry: entry(1), message: 'refused' }])
    expect(outcome.remaining).toEqual([])
  })

  it('stops on a transient failure and keeps the rest queued', async () => {
    const replay = vi.fn().mockResolvedValueOnce({}).mockRejectedValueOnce('network')
    const outcome = await syncQueue([entry(1), entry(2), entry(3)], replay, final, String)
    expect(outcome.synced).toBe(1)
    expect(outcome.remaining.map((e) => e.bookingId)).toEqual([2, 3])
    expect(replay).toHaveBeenCalledTimes(2)
  })
})
