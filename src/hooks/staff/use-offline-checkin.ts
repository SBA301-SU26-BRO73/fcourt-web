import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { getApiErrorMessage, isApiError } from '@/common/utils/api-error'
import { getOfflineTickets, replayOfflineCheckIn } from '@/services/staff/counter.api'
import { newIdempotencyKey } from '@/services/booking/booking.api'
import {
  hashCheckInCode,
  loadQueue,
  loadSnapshot,
  matchOfflineTicket,
  saveQueue,
  saveSnapshot,
  syncQueue,
  type OfflineMatch,
  type SyncOutcome,
} from '@/utils/offline-checkin'
import type { OfflineSnapshot, PendingOfflineCheckIn } from '@/types/counter'

/** A 4xx other than auth/rate-limit means the server will never accept that entry. */
function isFinalError(error: unknown) {
  return isApiError(error) && error.status >= 400 && error.status < 500 && ![401, 408, 429].includes(error.status)
}

/**
 * Offline check-in: download today's signed permits while online, accept scans from them when the
 * network is gone, and replay the queue (with the original time) once it is back.
 */
export function useOfflineCheckin() {
  const queryClient = useQueryClient()
  const [snapshot, setSnapshot] = useState<OfflineSnapshot | null>(() => loadSnapshot())
  const [queue, setQueue] = useState<PendingOfflineCheckIn[]>(() => loadQueue())
  const [downloading, setDownloading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastOutcome, setLastOutcome] = useState<SyncOutcome | null>(null)
  const [error, setError] = useState<string | null>(null)
  const queueRef = useRef(queue)
  const syncingRef = useRef(false)

  const updateQueue = useCallback((next: PendingOfflineCheckIn[]) => {
    queueRef.current = next
    setQueue(next)
    saveQueue(next)
  }, [])

  const download = useCallback(async () => {
    setDownloading(true)
    setError(null)
    try {
      const fresh = await getOfflineTickets()
      saveSnapshot(fresh)
      setSnapshot(fresh)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không tải được danh sách vé offline'))
    } finally {
      setDownloading(false)
    }
  }, [])

  const sync = useCallback(async () => {
    if (syncingRef.current || queueRef.current.length === 0) return
    syncingRef.current = true
    setSyncing(true)
    try {
      const outcome = await syncQueue(
        queueRef.current,
        (entry) => replayOfflineCheckIn(entry.permit, entry.occurredAt, entry.idempotencyKey),
        isFinalError,
        (err) => getApiErrorMessage(err, 'Server từ chối check-in offline'),
      )
      updateQueue(outcome.remaining)
      setLastOutcome(outcome)
      if (outcome.synced > 0) queryClient.invalidateQueries({ queryKey: ['staff-schedule'] })
    } finally {
      syncingRef.current = false
      setSyncing(false)
    }
  }, [queryClient, updateQueue])

  /** Accepts a scanned code from the downloaded snapshot and queues it for replay. */
  const checkInOffline = useCallback(
    async (code: string): Promise<OfflineMatch> => {
      const match = matchOfflineTicket(await hashCheckInCode(code), snapshot, queueRef.current)
      if (match.ok) {
        updateQueue([
          ...queueRef.current,
          {
            idempotencyKey: newIdempotencyKey(),
            bookingId: match.ticket.bookingId,
            courtName: match.ticket.courtName,
            customerName: match.ticket.customerName,
            permit: match.ticket.permit,
            occurredAt: new Date().toISOString(),
          },
        ])
      }
      return match
    },
    [snapshot, updateQueue],
  )

  useEffect(() => {
    const onOnline = () => void sync()
    window.addEventListener('online', onOnline)
    if (navigator.onLine) void sync()
    return () => window.removeEventListener('online', onOnline)
  }, [sync])

  return { snapshot, queue, downloading, syncing, lastOutcome, error, download, sync, checkInOffline }
}
