import { Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, CheckCircle, ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Field } from '@/components/ui/field'
import { useBranchGrid } from '@/hooks/staff/use-branch-grid'
import { usePublicCourtSlots } from '@/hooks/use-public-branches'
import { useWalkIn } from '@/hooks/staff/use-walk-in'
import { WalkInSlotGrid } from '@/pages/staff/components/walk-in-slot-grid'
import { summarizeWalkIn, toggleWalkInSlot, todayIso } from '@/pages/staff/counter-utils'
import { formatClock } from '@/pages/staff/schedule-utils'
import { getApiErrorMessage } from '@/common/utils/api-error'
import type { WalkInResult } from '@/types/counter'

/** Same rule as the server: optional +, 9 to 15 digits. */
const PHONE_RE = /^\+?[0-9]{9,15}$/

const TODAY_LABEL = new Date().toLocaleDateString('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const STEPS = [
  { n: 1, label: 'Customer' },
  { n: 2, label: 'Court & time' },
  { n: 3, label: 'Confirm' },
]

export function StaffWalkInPage() {
  const navigate = useNavigate()
  const { courts } = useBranchGrid()
  const walkInMutation = useWalkIn()
  const date = todayIso()

  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [guestName, setGuestName] = useState('')
  const [courtId, setCourtId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [serverError, setServerError] = useState<string | null>(null)
  const [created, setCreated] = useState<WalkInResult | null>(null)

  // Derive the active court: user pick first, fall back to first loaded court
  const effectiveCourtId = courtId ?? courts?.[0]?.id ?? null

  const slotsQuery = usePublicCourtSlots(effectiveCourtId, date)
  const slots = slotsQuery.data

  const phoneValid = PHONE_RE.test(phone)

  const summary = useMemo(() => summarizeWalkIn(selectedIds, slots ?? []), [selectedIds, slots])
  const { total } = summary

  const rangeLabel =
    summary.startTime && summary.endTime
      ? `${formatClock(summary.startTime)} – ${formatClock(summary.endTime)}`
      : '—'

  const selectedCourt = courts?.find((c) => c.id === effectiveCourtId)

  function handleToggle(slotId: number) {
    if (!slots) return
    setSelectedIds((prev) => toggleWalkInSlot(slotId, prev, slots))
  }

  function handleCourtChange(id: number) {
    setCourtId(id)
    setSelectedIds([])
  }

  function handleSubmit() {
    if (effectiveCourtId == null) return
    setServerError(null)
    const name = guestName.trim()
    walkInMutation.mutate(
      {
        courtId: effectiveCourtId,
        date,
        slotIds: summary.chosen.map((slot) => slot.slotId),
        guestPhone: phone,
        ...(name ? { guestName: name } : {}),
      },
      {
        onSuccess: (result) => setCreated(result),
        onError: (err) => {
          setServerError(getApiErrorMessage(err))
          void slotsQuery.refetch()
        },
      },
    )
  }

  if (created) {
    return (
      <div className="mx-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white p-7 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white">
          <CheckCircle size={32} />
        </div>
        <h2 className="mb-1 text-xl font-bold tracking-tight text-slate-900">Walk-in booking created</h2>
        <p className="mb-5 text-sm text-slate-500">
          {selectedCourt?.name} · {rangeLabel} · mã <span className="font-mono">{created.bookingCode}</span>
        </p>
        <div className="mb-5 flex flex-col gap-1.5 rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Biên nhận</span>
            <span className="font-mono">{created.invoice.receiptCode}</span>
          </div>
          <div className="flex justify-between">
            <span>Tiền sân</span>
            <span className="font-mono">{created.invoice.baseAmount.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between">
            <span>Phụ thu</span>
            <span className="font-mono">{created.invoice.surchargeAmount.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
            <span>Đã thu tiền mặt</span>
            <span className="font-mono">{created.invoice.totalAmount.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
        <Button variant="primary" className="h-12 w-full justify-center" onClick={() => navigate('/staff')}>
          Back to today&apos;s schedule
        </Button>
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
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            New walk-in booking
          </h1>
          <p className="text-sm text-slate-500">
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
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    step > s.n
                      ? 'bg-green-600 text-white'
                      : step === s.n
                        ? 'border-2 border-green-600 text-green-600'
                        : 'border border-slate-300 text-slate-400'
                  }`}
                >
                  {step > s.n ? <Check size={14} strokeWidth={3} /> : s.n}
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
          <h2 className="mb-1 text-base font-semibold text-slate-900">
            Who's the customer?
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Phone number is required to create the booking.
          </p>
          <Field
            label="Phone number"
            required
            hint="9–15 digits, e.g. 0912345678"
            error={
              phone.length > 0 && !phoneValid
                ? 'Invalid phone number (9–15 digits, numbers only)'
                : null
            }
          >
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-3.5 font-mono text-base tracking-wider text-slate-900 placeholder-slate-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              placeholder="0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ''))}
              maxLength={16}
              inputMode="numeric"
            />
          </Field>
          <div className="mt-4">
            <Field label="Customer name" hint="Optional">
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-base text-slate-900 placeholder-slate-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="Nguyễn Văn A"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                maxLength={150}
              />
            </Field>
          </div>
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
          <h2 className="mb-1 text-base font-semibold text-slate-900">
            Pick a court and time
          </h2>
          <p className="mb-5 text-sm text-slate-500">
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
                    {c.name}
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

          <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
            <span>{selectedCourt?.name} · 30-min slots</span>
            {selectedIds.length > 0 && (
              <span className="font-mono font-semibold text-slate-800">
                {rangeLabel} · {total.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          {slots == null || slots.length === 0 ? (
            <div className="rounded-xl border border-slate-200 py-8 text-center text-sm text-slate-400">
              {slotsQuery.isError
                ? 'Could not load the slots.'
                : slots == null
                  ? 'Loading slots…'
                  : 'No slots configured for this court today.'}
            </div>
          ) : (
            <WalkInSlotGrid slots={slots} selectedIds={selectedIds} onToggle={handleToggle} />
          )}

          <div className="mt-6 flex justify-between">
            <Button
              variant="ghost"
              icon={<ChevronLeft size={14} />}
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              variant="primary"
              icon={<ArrowRight size={16} />}
              disabled={selectedIds.length === 0}
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
          <h2 className="mb-1 text-base font-semibold text-slate-900">
            Confirm walk-in booking
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Collect{' '}
            <strong className="text-slate-900">{total.toLocaleString('vi-VN')}đ</strong> at the
            counter, then create the booking.
          </p>

          <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-slate-50 p-5">
            {(
              [
                { label: 'Phone', value: phone, mono: true },
                { label: 'Name', value: guestName.trim() || '—', mono: false },
                { label: 'Court', value: selectedCourt?.name ?? '—', mono: false },
                { label: 'Date', value: `Today · ${TODAY_LABEL}`, mono: false },
                { label: 'Time', value: rangeLabel, mono: true },
                { label: 'Slots', value: `${selectedIds.length} × 30 min`, mono: false },
              ] as const
            ).map(({ label, value, mono }) => (
              <div key={label}>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {label}
                </div>
                <div
                  className={`mt-0.5 text-sm font-medium text-slate-800 ${mono ? 'font-mono' : ''}`}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
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
              icon={<ChevronLeft size={14} />}
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
