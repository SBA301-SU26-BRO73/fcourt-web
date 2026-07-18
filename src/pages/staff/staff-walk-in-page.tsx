import { Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, CheckCircle, ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Field } from '@/components/ui/field'
import { useStaffSession } from '@/context/staff-session'
import { useBranchGrid } from '@/hooks/staff/use-branch-grid'
import { useTodaySchedule } from '@/hooks/staff/use-today-schedule'
import { useCourtSlotTemplates } from '@/hooks/staff/use-court-slot-templates'
import { useWalkInBooking } from '@/hooks/staff/use-walk-in-booking'
import { WalkInSlotGrid } from '@/pages/staff/components/walk-in-slot-grid'
import { timeToMinutes, formatClock } from '@/pages/staff/schedule-utils'
import { getApiErrorMessage } from '@/common/utils/api-error'
import type { StaffScheduleItem } from '@/types/staff'
import type { TimeSlotTemplate } from '@/types/booking'

const PHONE_RE = /^[0-9]{9,11}$/

const TODAY_LABEL = new Date().toLocaleDateString('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

function expandBookedTimes(
  schedule: StaffScheduleItem[] | undefined,
  courtId: number,
): Set<string> {
  const set = new Set<string>()
  schedule
    ?.filter((b) => b.courtId === courtId && b.status !== 'CANCELLED')
    .forEach((b) => {
      const startMin = timeToMinutes(b.startTime)
      for (let i = 0; i < b.slotCount; i++) {
        const m = startMin + i * 30
        const hh = String(Math.floor(m / 60)).padStart(2, '0')
        const mm = String(m % 60).padStart(2, '0')
        set.add(`${hh}:${mm}:00`)
      }
    })
  return set
}

function toggleSlotFn(
  startTime: string,
  prev: string[],
  templates: TimeSlotTemplate[],
  bookedTimes: Set<string>,
): string[] {
  if (bookedTimes.has(startTime)) return prev
  if (prev.includes(startTime)) return prev.filter((t) => t !== startTime)
  if (prev.length === 0) return [startTime]
  const idx = templates.findIndex((t) => t.startTime === startTime)
  const prevIdxs = prev
    .map((t) => templates.findIndex((tmpl) => tmpl.startTime === t))
    .sort((a, b) => a - b)
  const minIdx = prevIdxs[0]
  const maxIdx = prevIdxs[prevIdxs.length - 1]
  if (idx === minIdx - 1 || idx === maxIdx + 1) return [...prev, startTime]
  return [startTime]
}

const STEPS = [
  { n: 1, label: 'Customer' },
  { n: 2, label: 'Court & time' },
  { n: 3, label: 'Confirm' },
]

export function StaffWalkInPage() {
  const navigate = useNavigate()
  const { staffUserId, branchId } = useStaffSession()
  const { courts } = useBranchGrid()
  const scheduleQuery = useTodaySchedule()
  const walkInMutation = useWalkInBooking()

  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [courtId, setCourtId] = useState<number | null>(null)
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [serverError, setServerError] = useState<string | null>(null)

  // Derive the active court: user pick first, fall back to first loaded court
  const effectiveCourtId = courtId ?? courts?.[0]?.id ?? null

  const { templates } = useCourtSlotTemplates(effectiveCourtId)

  const bookedTimes = useMemo(
    () => expandBookedTimes(scheduleQuery.data, effectiveCourtId ?? 0),
    [scheduleQuery.data, effectiveCourtId],
  )

  const phoneValid = PHONE_RE.test(phone)

  const selectedSorted = useMemo(() => [...selectedTimes].sort(), [selectedTimes])

  const firstTmpl = templates?.find((t) => t.startTime === selectedSorted[0])
  const lastTmpl = templates?.find((t) => t.startTime === selectedSorted[selectedSorted.length - 1])

  const rangeLabel =
    selectedSorted.length && firstTmpl && lastTmpl
      ? `${formatClock(firstTmpl.startTime)} – ${formatClock(lastTmpl.endTime)}`
      : '—'

  const total = useMemo(
    () =>
      selectedSorted.reduce((sum, time) => {
        const tmpl = templates?.find((t) => t.startTime === time)
        return sum + (tmpl?.price ?? 0)
      }, 0),
    [selectedSorted, templates],
  )

  const selectedCourt = courts?.find((c) => c.id === effectiveCourtId)

  function handleToggle(startTime: string) {
    if (!templates) return
    setSelectedTimes((prev) => toggleSlotFn(startTime, prev, templates, bookedTimes))
  }

  function handleCourtChange(id: number) {
    setCourtId(id)
    setSelectedTimes([])
  }

  function handleSubmit() {
    if (staffUserId == null || effectiveCourtId == null) return
    setServerError(null)
    walkInMutation.mutate(
      { staffUserId, courtId: effectiveCourtId, guestPhone: phone, slotStarts: selectedSorted },
      {
        onSuccess: () => navigate('/staff'),
        onError: (err) => setServerError(getApiErrorMessage(err)),
      },
    )
  }

  if (staffUserId == null || branchId == null) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        No staff session. Set <code className="font-mono">VITE_STAFF_USER_ID</code> and{' '}
        <code className="font-mono">VITE_BRANCH_ID</code> in{' '}
        <code className="font-mono">.env.local</code>.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header with stepper */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          icon={<ChevronLeft size={16} />}
          onClick={() => navigate('/staff')}
        >
          Cancel
        </Button>
        <div className="leading-tight">
          <h1 className="text-base font-bold tracking-tight text-slate-900">
            New walk-in booking
          </h1>
          <p className="text-[12.5px] text-slate-500">
            Payment will be collected at the counter
          </p>
        </div>
        <span className="ml-auto" />
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <Fragment key={s.n}>
              <div
                className={`flex items-center gap-1.5 text-xs font-medium ${
                  step === s.n
                    ? 'text-green-700'
                    : step > s.n
                      ? 'text-slate-500'
                      : 'text-slate-400'
                }`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    step > s.n
                      ? 'bg-green-600 text-white'
                      : step === s.n
                        ? 'border-2 border-green-600 text-green-600'
                        : 'border border-slate-300 text-slate-400'
                  }`}
                >
                  {step > s.n ? <Check size={10} strokeWidth={3} /> : s.n}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-px w-5 ${step > s.n ? 'bg-green-400' : 'bg-slate-200'}`}
                />
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Step 1 — Customer */}
      {step === 1 && (
        <div className="mx-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white p-7">
          <h2 className="mb-1 text-lg font-bold tracking-tight text-slate-900">
            Who's the customer?
          </h2>
          <p className="mb-6 text-[13px] text-slate-500">
            Phone number is required to create the booking.
          </p>
          <Field
            label="Phone number"
            required
            hint="9–11 digits, e.g. 0912345678"
            error={
              phone.length > 0 && !phoneValid
                ? 'Invalid phone number (9–11 digits, numbers only)'
                : null
            }
          >
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-3.5 font-mono text-base tracking-wider text-slate-900 placeholder-slate-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              placeholder="0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              maxLength={11}
              inputMode="numeric"
            />
          </Field>
          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              icon={<ArrowRight size={16} />}
              disabled={!phoneValid}
              onClick={() => setStep(2)}
              className="px-5 py-2.5 text-sm"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Court & time */}
      {step === 2 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-1 text-lg font-bold tracking-tight text-slate-900">
            Pick a court and time
          </h2>
          <p className="mb-5 text-[13px] text-slate-500">
            Select one or more consecutive 30-minute slots. Booked slots are dimmed.
          </p>

          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Court">
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                value={effectiveCourtId ?? ''}
                onChange={(e) => handleCourtChange(Number(e.target.value))}
              >
                {(courts ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.courtTypeName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <div className="flex h-[42px] items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                Today · {TODAY_LABEL}
              </div>
            </Field>
          </div>

          <div className="mb-3 flex items-center justify-between text-[12.5px] text-slate-500">
            <span>{selectedCourt?.courtTypeName} · 30-min slots</span>
            {selectedSorted.length > 0 && (
              <span className="font-mono font-semibold text-slate-800">
                {rangeLabel} · {total.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          {templates == null || templates.length === 0 ? (
            <div className="rounded-xl border border-slate-200 py-8 text-center text-sm text-slate-400">
              {templates == null
                ? 'Loading slots…'
                : 'No slots configured for this court today.'}
            </div>
          ) : (
            <WalkInSlotGrid
              templates={templates}
              bookedTimes={bookedTimes}
              selectedTimes={selectedTimes}
              onToggle={handleToggle}
            />
          )}

          <div className="mt-6 flex justify-between">
            <Button
              variant="ghost"
              icon={<ChevronLeft size={15} />}
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              variant="primary"
              icon={<ArrowRight size={16} />}
              disabled={selectedSorted.length === 0}
              onClick={() => setStep(3)}
              className="px-5 py-2.5 text-sm"
            >
              Review booking
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && (
        <div className="mx-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white p-7">
          <h2 className="mb-1 text-lg font-bold tracking-tight text-slate-900">
            Confirm walk-in booking
          </h2>
          <p className="mb-6 text-[13px] text-slate-500">
            Collect{' '}
            <strong className="text-slate-900">{total.toLocaleString('vi-VN')}đ</strong> at the
            counter, then create the booking.
          </p>

          <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-slate-50 p-5">
            {(
              [
                { label: 'Phone', value: phone, mono: true },
                { label: 'Court', value: selectedCourt?.name ?? '—', mono: false },
                { label: 'Date', value: `Today · ${TODAY_LABEL}`, mono: false },
                { label: 'Time', value: rangeLabel, mono: true },
                { label: 'Slots', value: `${selectedSorted.length} × 30 min`, mono: false },
              ] as const
            ).map(({ label, value, mono }) => (
              <div key={label}>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {label}
                </div>
                <div
                  className={`mt-0.5 text-[14px] font-medium text-slate-800 ${mono ? 'font-mono' : ''}`}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Total due at counter
              </div>
              <div className="font-mono text-3xl font-bold tracking-tight text-slate-900">
                {total.toLocaleString('vi-VN')}đ
              </div>
            </div>
            <Badge tone="amber">Pay at counter</Badge>
          </div>

          {serverError && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {serverError}
            </p>
          )}

          <div className="flex justify-between">
            <Button
              variant="ghost"
              icon={<ChevronLeft size={15} />}
              onClick={() => setStep(2)}
            >
              Back
            </Button>
            <Button
              variant="primary"
              icon={<CheckCircle size={16} />}
              disabled={walkInMutation.isPending}
              onClick={handleSubmit}
              className="px-5 py-2.5 text-sm"
            >
              {walkInMutation.isPending ? 'Creating…' : 'Create booking'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
