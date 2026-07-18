import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle, ChevronLeft, Flag, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStaffSession } from '@/context/staff-session'
import { useCheckout } from '@/hooks/staff/use-checkout'
import { useTodaySchedule } from '@/hooks/staff/use-today-schedule'
import { formatClock } from '@/pages/staff/schedule-utils'
import { getApiErrorMessage } from '@/common/utils/api-error'
import type { StaffScheduleItem } from '@/types/staff'
import type { StaffCheckoutResponse } from '@/types/booking'

export function StaffCheckoutPage() {
  const navigate = useNavigate()
  const { bookingId: bookingIdStr } = useParams<{ bookingId: string }>()
  const bookingId = Number(bookingIdStr)
  const location = useLocation()
  const { staffUserId } = useStaffSession()
  const checkoutMutation = useCheckout()
  const scheduleQuery = useTodaySchedule()

  const stateItem = location.state as StaffScheduleItem | null
  const item =
    stateItem ?? scheduleQuery.data?.find((b) => b.bookingId === bookingId) ?? null

  const [result, setResult] = useState<StaffCheckoutResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleCheckout() {
    if (staffUserId == null) return
    setError(null)
    checkoutMutation.mutate(bookingId, {
      onSuccess: (data) => setResult(data),
      onError: (err) => setError(getApiErrorMessage(err)),
    })
  }

  if (staffUserId == null) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        No staff session. Set <code className="font-mono">VITE_STAFF_USER_ID</code> in{' '}
        <code className="font-mono">.env.local</code>.
      </div>
    )
  }

  if (!item && scheduleQuery.isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
        Loading booking…
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">Booking not found.</p>
        <Button
          variant="ghost"
          icon={<ChevronLeft size={16} />}
          onClick={() => navigate('/staff')}
        >
          Back to schedule
        </Button>
      </div>
    )
  }

  /* ── Success state ── */
  if (result) {
    return (
      <div className="grid min-h-[520px] place-items-center">
        <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center">
          <div className="relative mx-auto mb-6 h-32 w-32">
            <div className="absolute inset-0 animate-ping rounded-full bg-green-100 opacity-60" />
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-green-600 text-white">
              <Flag size={46} strokeWidth={2.4} />
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
            Court is now free
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            {result.courtName} is ready for the next session.
          </p>

          <div className="mb-6 grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-slate-50 p-5 text-left">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Status
              </div>
              <div className="mt-0.5">
                <Badge tone="gray">COMPLETED</Badge>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Court
              </div>
              <div className="mt-0.5 text-[14px] font-medium text-slate-800">
                {result.courtName}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Total
              </div>
              <div className="mt-0.5 font-mono text-[14px] font-medium text-slate-800">
                {result.totalPrice.toLocaleString('vi-VN')}đ
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Booking
              </div>
              <div className="mt-0.5 font-mono text-[14px] font-medium text-slate-800">
                #{result.bookingId}
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            className="h-12 w-full justify-center text-base"
            onClick={() => navigate('/staff')}
          >
            Back to today's schedule
          </Button>
        </div>
      </div>
    )
  }

  /* ── Confirm state ── */
  return (
    <div className="grid min-h-[520px] place-items-center">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8">
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            icon={<ChevronLeft size={15} />}
            onClick={() => navigate('/staff')}
          >
            Schedule
          </Button>
          <span className="ml-auto" />
          <Badge tone="green">Checked in</Badge>
        </div>

        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-700">
            <LogOut size={28} />
          </div>
          <h2 className="mb-1.5 text-xl font-bold tracking-tight text-slate-900">
            Check out customer?
          </h2>
          <p className="text-[13.5px] text-slate-500">
            This will free the court for the next session.
          </p>
        </div>

        <div className="mb-7 grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-slate-50 p-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Customer
            </div>
            <div className="mt-0.5 text-[14px] font-medium text-slate-800">
              {item.customerName ?? item.guestPhone ?? 'Guest'}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Court
            </div>
            <div className="mt-0.5 text-[14px] font-medium text-slate-800">{item.courtName}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Time slot
            </div>
            <div className="mt-0.5 font-mono text-[14px] font-medium text-slate-800">
              {formatClock(item.startTime)} – {formatClock(item.endTime)}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Phone
            </div>
            <div className="mt-0.5 font-mono text-[14px] font-medium text-slate-800">
              {item.guestPhone ?? '—'}
            </div>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <Button
          variant="primary"
          className="h-[72px] w-full justify-center text-lg font-bold"
          icon={<CheckCircle size={22} />}
          disabled={checkoutMutation.isPending}
          onClick={handleCheckout}
        >
          {checkoutMutation.isPending ? 'Checking out…' : 'Confirm customer has left'}
        </Button>
        <div className="mt-3 text-center">
          <button
            type="button"
            className="text-[13px] text-slate-400 underline-offset-2 hover:underline"
            onClick={() => navigate('/staff')}
          >
            Not yet — keep court reserved
          </button>
        </div>
      </div>
    </div>
  )
}
