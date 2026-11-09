import type { OfflineSnapshot, OfflineTicket, PendingOfflineCheckIn } from '@/types/counter'

const SNAPSHOT_KEY = 'fcourt.staff.offline.snapshot'
const QUEUE_KEY = 'fcourt.staff.offline.queue'

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be full or blocked; the caller still has the value in memory.
  }
}

export function loadSnapshot(): OfflineSnapshot | null {
  return read<OfflineSnapshot>(SNAPSHOT_KEY)
}

export function saveSnapshot(snapshot: OfflineSnapshot) {
  write(SNAPSHOT_KEY, snapshot)
}

export function loadQueue(): PendingOfflineCheckIn[] {
  return read<PendingOfflineCheckIn[]>(QUEUE_KEY) ?? []
}

export function saveQueue(queue: PendingOfflineCheckIn[]) {
  write(QUEUE_KEY, queue)
}

/** SHA-256 hex of the trimmed check-in code, the same value the server puts in `codeHash`. */
export async function hashCheckInCode(code: string): Promise<string> {
  const bytes = new TextEncoder().encode(code.trim())
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

export type OfflineMatch =
  | { ok: true; ticket: OfflineTicket }
  | { ok: false; reason: 'NO_SNAPSHOT' | 'UNKNOWN_CODE' | 'NOT_YET_VALID' | 'EXPIRED' | 'ALREADY_QUEUED' }

/** Looks a scanned code up in the downloaded snapshot and checks the permit window. */
export function matchOfflineTicket(
  codeHash: string,
  snapshot: OfflineSnapshot | null,
  queue: PendingOfflineCheckIn[],
  now: Date = new Date(),
): OfflineMatch {
  if (!snapshot) return { ok: false, reason: 'NO_SNAPSHOT' }
  const ticket = snapshot.tickets.find((t) => t.codeHash === codeHash)
  if (!ticket) return { ok: false, reason: 'UNKNOWN_CODE' }
  if (queue.some((q) => q.bookingId === ticket.bookingId)) return { ok: false, reason: 'ALREADY_QUEUED' }
  const time = now.getTime()
  if (time < new Date(ticket.validFrom).getTime()) return { ok: false, reason: 'NOT_YET_VALID' }
  if (time >= new Date(ticket.validUntil).getTime()) return { ok: false, reason: 'EXPIRED' }
  return { ok: true, ticket }
}

export const OFFLINE_REASON_TEXT: Record<Exclude<OfflineMatch, { ok: true }>['reason'], string> = {
  NO_SNAPSHOT: 'Chưa tải danh sách vé offline. Hãy tải khi còn mạng.',
  UNKNOWN_CODE: 'Mã không có trong danh sách vé offline hôm nay.',
  NOT_YET_VALID: 'Chưa đến giờ check-in cho vé này.',
  EXPIRED: 'Vé đã hết hạn check-in.',
  ALREADY_QUEUED: 'Vé này đã được check-in offline, đang chờ đồng bộ.',
}

export interface SyncOutcome {
  synced: number
  /** Entries the server refused for good (not a network problem); they are dropped from the queue. */
  rejected: Array<{ entry: PendingOfflineCheckIn; message: string }>
  /** Entries still queued because the network or the server was unavailable. */
  remaining: PendingOfflineCheckIn[]
}

/**
 * Replays queued offline check-ins in order. A 4xx answer is final for that entry (dropped and
 * reported); anything else stops the run so the rest is retried later.
 */
export async function syncQueue(
  queue: PendingOfflineCheckIn[],
  replay: (entry: PendingOfflineCheckIn) => Promise<unknown>,
  isFinalError: (error: unknown) => boolean,
  messageOf: (error: unknown) => string,
): Promise<SyncOutcome> {
  const rejected: SyncOutcome['rejected'] = []
  let synced = 0
  const remaining = [...queue]
  while (remaining.length > 0) {
    const entry = remaining[0]
    try {
      await replay(entry)
      synced += 1
      remaining.shift()
    } catch (error) {
      if (!isFinalError(error)) break
      rejected.push({ entry, message: messageOf(error) })
      remaining.shift()
    }
  }
  return { synced, rejected, remaining }
}
