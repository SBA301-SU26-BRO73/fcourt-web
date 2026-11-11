import { CloudDownload, RefreshCw, WifiOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { OfflineSnapshot, PendingOfflineCheckIn } from '@/types/counter'
import type { SyncOutcome } from '@/utils/offline-checkin'

interface OfflinePanelProps {
  snapshot: OfflineSnapshot | null
  queue: PendingOfflineCheckIn[]
  downloading: boolean
  syncing: boolean
  lastOutcome: SyncOutcome | null
  error: string | null
  onDownload: () => void
  onSync: () => void
}

/** Prepares check-in for a bad connection: today's tickets are kept on this device and replayed later. */
export function OfflinePanel({
  snapshot,
  queue,
  downloading,
  syncing,
  lastOutcome,
  error,
  onDownload,
  onSync,
}: OfflinePanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <WifiOff size={14} />
        Check-in offline
      </div>
      <p className="text-xs text-slate-500">
        {snapshot
          ? `Đã lưu ${snapshot.tickets.length} vé hôm nay (${new Date(snapshot.generatedAt).toLocaleTimeString('vi-VN')}).`
          : 'Tải danh sách vé hôm nay khi còn mạng để vẫn check-in được lúc mất mạng.'}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          disabled={downloading}
          onClick={onDownload}
          icon={<CloudDownload size={14} />}
        >
          {downloading ? 'Đang tải…' : 'Tải vé offline'}
        </Button>
        {queue.length > 0 && (
          <Button variant="neutral" disabled={syncing} onClick={onSync} icon={<RefreshCw size={14} />}>
            {syncing ? 'Đang đồng bộ…' : `Đồng bộ ${queue.length} check-in`}
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {lastOutcome && lastOutcome.synced > 0 && (
        <p className="text-xs text-green-700">Đã đồng bộ {lastOutcome.synced} check-in offline.</p>
      )}
      {lastOutcome?.rejected.map(({ entry, message }) => (
        <p key={entry.idempotencyKey} className="text-xs text-red-600">
          #{entry.bookingId} ({entry.courtName}): {message}
        </p>
      ))}
    </div>
  )
}
