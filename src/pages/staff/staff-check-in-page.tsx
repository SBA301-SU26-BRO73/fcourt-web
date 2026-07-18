import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, CheckCircle, QrCode } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useStaffSession } from '@/context/staff-session'
import { useCheckin } from '@/hooks/staff/use-checkin'
import { getApiErrorMessage } from '@/common/utils/api-error'
import { QrScanner } from '@/pages/staff/components/qr-scanner'
import { ManualCodeInput } from '@/pages/staff/components/manual-code-input'
import { ScanErrorOverlay } from '@/pages/staff/components/scan-error-overlay'
import { CheckinSuccess } from '@/pages/staff/components/checkin-success'

const AUTO_RETURN_MS = 30_000

export function StaffCheckInPage() {
  const navigate = useNavigate()
  const { staffUserId, branchId } = useStaffSession()
  const checkin = useCheckin()
  const { isSuccess, isError, isPending, data, error, mutate, reset } = checkin

  const [code, setCode] = useState<string | null>(null)

  const handleDecode = useCallback((text: string) => setCode(text), [])

  function resetAll() {
    reset()
    setCode(null)
  }

  // Auto-return to the scanner after a successful check-in.
  useEffect(() => {
    if (!isSuccess) return
    const t = setTimeout(() => {
      reset()
      setCode(null)
    }, AUTO_RETURN_MS)
    return () => clearTimeout(t)
  }, [isSuccess, reset])

  if (staffUserId == null || branchId == null) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        No staff session. Set <code className="font-mono">VITE_STAFF_USER_ID</code>{' '}
        and <code className="font-mono">VITE_BRANCH_ID</code> in{' '}
        <code className="font-mono">.env.local</code> and restart the dev server.
      </div>
    )
  }

  if (isSuccess && data) {
    return (
      <CheckinSuccess
        result={data}
        onScanNext={resetAll}
        onBackToSchedule={() => navigate('/staff')}
      />
    )
  }

  const scannerActive = code == null && !isError

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
          <p className="text-[13px] text-slate-500">
            Point the camera at the booking QR, or enter the code.
          </p>
        </div>
      </div>

      {/* Stage */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: scanner */}
        <div className="relative">
          <QrScanner active={scannerActive} onDecode={handleDecode} />
          {isError && (
            <ScanErrorOverlay
              message={getApiErrorMessage(error, 'Invalid check-in code')}
              onRetry={resetAll}
            />
          )}
        </div>

        {/* Right: controls */}
        <div className="flex flex-col gap-4">
          <ManualCodeInput onSubmit={setCode} disabled={isPending} />

          {code ? (
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle size={16} className="text-green-600" />
                Code ready
              </div>
              <div className="break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
                {code}
              </div>
              <Button
                variant="primary"
                disabled={isPending}
                onClick={() => mutate(code)}
                className="h-14 justify-center text-base"
                icon={<CheckCircle size={20} />}
              >
                {isPending ? 'Checking in…' : 'Confirm check-in'}
              </Button>
              <button
                type="button"
                className="text-xs text-slate-400 underline-offset-2 hover:underline"
                onClick={() => setCode(null)}
                disabled={isPending}
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
              <p className="max-w-[280px] text-[13px] text-slate-500">
                Scan the booking QR or enter the code to check the customer in.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
