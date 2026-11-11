import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, CheckCircle, QrCode } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCheckin, useCheckInPreview, type CheckInSource } from '@/hooks/staff/use-checkin'
import { useOfflineCheckin } from '@/hooks/staff/use-offline-checkin'
import { getApiErrorMessage, isApiError } from '@/common/utils/api-error'
import { formatClock } from '@/pages/staff/schedule-utils'
import { QrScanner } from '@/pages/staff/components/qr-scanner'
import { ManualCodeInput } from '@/pages/staff/components/manual-code-input'
import { ScanErrorOverlay } from '@/pages/staff/components/scan-error-overlay'
import { CheckinSuccess, type CheckinSummary } from '@/pages/staff/components/checkin-success'
import { OfflinePanel } from '@/pages/staff/components/offline-panel'
import { OFFLINE_REASON_TEXT } from '@/utils/offline-checkin'

const AUTO_RETURN_MS = 30_000

interface Scan {
  code: string
  source: CheckInSource
}

export function StaffCheckInPage() {
  const navigate = useNavigate()
  const preview = useCheckInPreview()
  const checkin = useCheckin()
  const offline = useOfflineCheckin()

  const [scan, setScan] = useState<Scan | null>(null)
  const [outcome, setOutcome] = useState<CheckinSummary | null>(null)
  const [offlineError, setOfflineError] = useState<string | null>(null)

  const { reset: resetPreview } = preview
  const { reset: resetCheckin } = checkin

  const resetAll = useCallback(() => {
    resetPreview()
    resetCheckin()
    setScan(null)
    setOutcome(null)
    setOfflineError(null)
  }, [resetPreview, resetCheckin])

  const acceptOffline = useCallback(
    async (code: string) => {
      const match = await offline.checkInOffline(code)
      if (!match.ok) {
        setOfflineError(OFFLINE_REASON_TEXT[match.reason])
        return
      }
      setOutcome({
        bookingId: match.ticket.bookingId,
        courtName: match.ticket.courtName,
        customerName: match.ticket.customerName,
        guestPhone: null,
        startTime: null,
        endTime: null,
        checkedInAt: new Date().toISOString(),
        offline: true,
      })
    },
    [offline],
  )

  function startScan(code: string, source: CheckInSource) {
    setOfflineError(null)
    setScan({ code, source })
    if (!navigator.onLine) {
      void acceptOffline(code)
      return
    }
    preview.mutate(code, {
      onError: (err) => {
        if (isApiError(err) && err.isNetworkError) void acceptOffline(code)
      },
    })
  }

  // The camera callback must stay stable; it always calls the latest startScan.
  const startScanRef = useRef(startScan)
  useEffect(() => {
    startScanRef.current = startScan
  })
  const handleDecode = useCallback((text: string) => startScanRef.current(text, 'QR'), [])

  function confirm() {
    if (!scan || !preview.data) return
    const ticket = preview.data
    checkin.mutate(scan, {
      onSuccess: (result) =>
        setOutcome({
          bookingId: result.bookingId,
          courtName: ticket.courtName,
          customerName: ticket.customerName,
          guestPhone: ticket.guestPhone,
          startTime: ticket.slotStart,
          endTime: ticket.slotEnd,
          checkedInAt: result.checkedInAt,
        }),
    })
  }

  // Auto-return to the scanner after a successful check-in.
  useEffect(() => {
    if (!outcome) return
    const t = setTimeout(resetAll, AUTO_RETURN_MS)
    return () => clearTimeout(t)
  }, [outcome, resetAll])

  if (outcome) {
    return (
      <CheckinSuccess
        result={outcome}
        onScanNext={resetAll}
        onBackToSchedule={() => navigate('/staff')}
      />
    )
  }

  const errorMessage =
    offlineError ??
    (preview.isError && !(isApiError(preview.error) && preview.error.isNetworkError)
      ? getApiErrorMessage(preview.error, 'Invalid check-in code')
      : null)
  const scannerActive = scan == null && errorMessage == null
  const ticket = preview.data
  const canConfirm = ticket?.status === 'CONFIRMED'

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          icon={<ChevronLeft size={16} />}
          onClick={() => navigate('/staff')}
        >
          Schedule
        </Button>
        <div className="leading-tight">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            Check in a customer
          </h1>
          <p className="text-sm text-slate-500">
            Point the camera at the booking QR, or enter the code.
          </p>
        </div>
      </div>

      {/* Stage */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: scanner */}
        <div className="relative">
          <QrScanner active={scannerActive} onDecode={handleDecode} />
          {errorMessage && <ScanErrorOverlay message={errorMessage} onRetry={resetAll} />}
        </div>

        {/* Right: controls */}
        <div className="flex flex-col gap-4">
          <ManualCodeInput
            onSubmit={(code) => startScan(code, 'MANUAL')}
            disabled={preview.isPending || checkin.isPending}
          />

          {scan && preview.isPending ? (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
              Đang tra cứu vé…
            </div>
          ) : ticket ? (
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle size={16} className="text-green-600" />
                Ticket found · #{ticket.bookingId}
                <span className="ml-auto" />
                <Badge tone={canConfirm ? 'green' : 'amber'}>{ticket.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg bg-slate-50 p-4 text-sm">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Customer</div>
                  <div className="mt-0.5 font-medium text-slate-800">
                    {ticket.customerName ?? ticket.guestPhone ?? 'Guest'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Court</div>
                  <div className="mt-0.5 font-medium text-slate-800">{ticket.courtName}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Time slot</div>
                  <div className="mt-0.5 font-mono font-medium text-slate-800">
                    {formatClock(ticket.slotStart)} – {formatClock(ticket.slotEnd)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Date</div>
                  <div className="mt-0.5 font-mono font-medium text-slate-800">{ticket.date}</div>
                </div>
              </div>
              {checkin.isError && (
                <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                  {getApiErrorMessage(checkin.error, 'Check-in failed')}
                </p>
              )}
              <Button
                variant="primary"
                disabled={checkin.isPending || !canConfirm}
                onClick={confirm}
                className="h-14 justify-center text-base"
                icon={<CheckCircle size={20} />}
              >
                {checkin.isPending ? 'Checking in…' : 'Confirm check-in'}
              </Button>
              <button
                type="button"
                className="text-xs text-slate-400 underline-offset-2 hover:underline"
                onClick={resetAll}
                disabled={checkin.isPending}
              >
                Clear code
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <QrCode size={28} />
              </div>
              <div className="text-sm font-semibold text-slate-700">
                Waiting for a code…
              </div>
              <p className="max-w-[280px] text-sm text-slate-500">
                Scan the booking QR or enter the code to check the customer in.
              </p>
            </div>
          )}

          <OfflinePanel
            snapshot={offline.snapshot}
            queue={offline.queue}
            downloading={offline.downloading}
            syncing={offline.syncing}
            lastOutcome={offline.lastOutcome}
            error={offline.error}
            onDownload={offline.download}
            onSync={offline.sync}
          />
        </div>
      </div>
    </div>
  )
}
