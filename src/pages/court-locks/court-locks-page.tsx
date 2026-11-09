import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Lock, Plus, Unlock } from 'lucide-react'

import { listBranches } from '@/services/branch/branch.api'
import { getCourtsByBranch } from '@/services/court/court.api'
import { getCourtLocks, lockBranchCourts, lockCourt, unlockCourt, unlockGroup } from '@/services/court-lock/court-lock.api'
import { ConfirmDialog, ErrorBanner, ScheduleTabs, Select, State, SuccessBanner } from '@/pages/time-slots/schedule-ui'
import { getTimeSlotErrorMessage, getTimeSlotFieldErrors } from '@/pages/time-slots/time-slot-error.utils'
import type { Court } from '@/types/court'
import type { CourtLock, CourtLockType } from '@/types/court-lock'
import {
  emptyCourtLockFormValues,
  toBranchLockRequest,
  toLockSlotsRequest,
  validateCourtLockForm,
  type CourtLockFormErrors,
  type CourtLockFormValues,
  type LockScope,
} from './court-lock-form.utils'

const TYPE_LABELS: Record<CourtLockType, string> = { OUT_OF_SERVICE: 'Bảo trì', PRIVATE_EVENT: 'Sự kiện riêng' }
const SCOPES: Array<{ value: LockScope; label: string }> = [
  { value: 'court', label: 'Một sân' },
  { value: 'courts', label: 'Nhiều sân của chi nhánh' },
  { value: 'branch', label: 'Toàn bộ chi nhánh' },
]

const fieldClass = (error?: string) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'}`

type PendingUnlock = { kind: 'lock'; lock: CourtLock } | { kind: 'group'; lock: CourtLock }

function formatWindow(lock: CourtLock) {
  const format = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
  return `${format.format(new Date(lock.startAt))} - ${format.format(new Date(lock.endAt))}`
}

export function CourtLocksPage() {
  const queryClient = useQueryClient()
  const [chosenBranchId, setChosenBranchId] = useState('')
  const [courtFilter, setCourtFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [pending, setPending] = useState<PendingUnlock | null>(null)
  const [message, setMessage] = useState('')

  const branchesQuery = useQuery({ queryKey: ['branches', 'owner-options'], queryFn: listBranches })
  const branches = useMemo(() => branchesQuery.data ?? [], [branchesQuery.data])
  const branchId = chosenBranchId || (branches[0] ? String(branches[0].id) : '')
  const courtsQuery = useQuery({ queryKey: ['courts', 'branch', branchId], queryFn: () => getCourtsByBranch(Number(branchId)), enabled: Boolean(branchId) })
  const courts = useMemo(() => courtsQuery.data ?? [], [courtsQuery.data])
  const locksQuery = useQuery({
    queryKey: ['court-locks', branchId, courtFilter],
    queryFn: () => getCourtLocks({ branchId: Number(branchId), courtId: courtFilter ? Number(courtFilter) : undefined }),
    enabled: Boolean(branchId),
    retry: false,
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['court-locks'] })
  const unlockMutation = useMutation({
    mutationFn: (target: PendingUnlock) => target.kind === 'group' && target.lock.groupId ? unlockGroup(target.lock.groupId) : unlockCourt(target.lock.id),
    onSuccess: async () => { await refresh(); setPending(null); setMessage('Đã mở khóa.') },
  })

  const courtName = (id: number) => courts.find((court) => court.id === id)?.name ?? `Sân #${id}`
  const locks = useMemo(() => [...(locksQuery.data ?? [])].sort((a, b) => b.startAt.localeCompare(a.startAt)), [locksQuery.data])

  return <div className="min-h-screen bg-[#F5F6F8] text-[#111827]"><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <ScheduleTabs />
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#10B981]">Lock slots</p><h1 className="mt-2 text-3xl font-black">Khóa slot và bảo trì</h1><p className="mt-2 text-sm text-slate-500">Khóa sân theo khoảng thời gian để bảo trì hoặc tổ chức sự kiện riêng. Slot đã có người đặt hoặc giữ sẽ không khóa được.</p></div><button type="button" onClick={() => setShowForm(true)} disabled={!branchId} className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-3 text-sm font-bold text-white hover:bg-[#059669] disabled:opacity-50"><Plus className="size-5" />Thêm khóa</button></div>

    {message && <SuccessBanner message={message} />}
    {unlockMutation.isError && <ErrorBanner error={unlockMutation.error} />}

    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-4">
      <Select label="Chi nhánh" value={branchId} onChange={(value) => { setChosenBranchId(value); setCourtFilter(''); setMessage('') }} options={branches.length ? branches.map((branch) => ({ value: String(branch.id), label: branch.name })) : [{ value: '', label: branchesQuery.isPending ? 'Đang tải...' : 'Chưa có chi nhánh' }]} />
      <Select label="Lọc theo sân" value={courtFilter} onChange={setCourtFilter} options={[{ value: '', label: 'Tất cả sân' }, ...courts.map((court) => ({ value: String(court.id), label: court.name }))]} />
    </div></section>

    {!branchId ? <State title={branchesQuery.isPending ? 'Đang tải chi nhánh...' : 'Chưa có chi nhánh nào'} /> : locksQuery.isPending ? <State title="Đang tải danh sách khóa..." /> : locksQuery.isError ? <State title="Không thể tải danh sách khóa" description={getTimeSlotErrorMessage(locksQuery.error)} action={() => void locksQuery.refetch()} /> : locks.length === 0 ? <State title="Chưa có khóa nào" /> : <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-200">{locks.map((lock) => <article key={lock.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
      <div className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-700"><Lock className="size-5" /></div>
      <div className="min-w-48 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{courtName(lock.courtId)}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${lock.type === 'PRIVATE_EVENT' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{TYPE_LABELS[lock.type]}</span>{lock.groupId && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">Theo nhóm</span>}</div><p className="mt-1 text-sm text-slate-600">{formatWindow(lock)}</p><p className="mt-1 text-sm text-slate-500">{lock.reason}{lock.notes ? ` · ${lock.notes}` : ''}</p>{(lock.publicReason || lock.contactName || lock.contactPhone) && <p className="mt-1 text-xs text-slate-400">Khách thấy: {[lock.publicReason, lock.contactName, lock.contactPhone].filter(Boolean).join(' · ')}</p>}</div>
      <div className="flex flex-wrap gap-2"><button onClick={() => setPending({ kind: 'lock', lock })} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700"><Unlock className="size-4" />Mở khóa</button>{lock.groupId && <button onClick={() => setPending({ kind: 'group', lock })} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50">Mở cả nhóm</button>}</div>
    </article>)}</div></div>}
  </main>
  {showForm && branchId && <LockDialog branchId={branchId} branches={branches.map((branch) => ({ value: String(branch.id), label: branch.name }))} courts={courts} onClose={() => setShowForm(false)} onSaved={async (text) => { await refresh(); setShowForm(false); setMessage(text) }} />}
  {pending && <ConfirmDialog title={pending.kind === 'group' ? 'Mở khóa cả nhóm?' : `Mở khóa ${courtName(pending.lock.courtId)}?`} description={pending.kind === 'group' ? 'Mọi sân khóa cùng đợt (cùng nhóm) sẽ được mở lại.' : 'Khách có thể đặt lại các slot trong khoảng thời gian này.'} confirmLabel={unlockMutation.isPending ? 'Đang mở khóa...' : 'Mở khóa'} isBusy={unlockMutation.isPending} onCancel={() => setPending(null)} onConfirm={() => unlockMutation.mutate(pending)} />}
  </div>
}

function LockDialog({ branchId, branches, courts, onClose, onSaved }: { branchId: string; branches: Array<{ value: string; label: string }>; courts: Court[]; onClose: () => void; onSaved: (message: string) => void }) {
  const [values, setValues] = useState<CourtLockFormValues>(() => emptyCourtLockFormValues(branchId))
  const [errors, setErrors] = useState<CourtLockFormErrors>({})
  const mutation = useMutation({
    mutationFn: async () => {
      if (values.scope === 'court') {
        await lockCourt(toLockSlotsRequest(values))
        return 1
      }
      return (await lockBranchCourts(toBranchLockRequest(values))).totalLocks
    },
    onSuccess: (count) => onSaved(`Đã khóa ${count} sân.`),
    onError: (error) => setErrors((current) => ({ ...current, ...(getTimeSlotFieldErrors(error) as CourtLockFormErrors) })),
  })
  function change(patch: Partial<CourtLockFormValues>) {
    setValues((current) => ({ ...current, ...patch }))
    setErrors({})
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = validateCourtLockForm(values)
    setErrors(next)
    if (Object.keys(next).length === 0) mutation.mutate()
  }
  const toggleCourt = (id: string) => change({ courtIds: values.courtIds.includes(id) ? values.courtIds.filter((item) => item !== id) : [...values.courtIds, id] })

  return <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 px-4 py-6"><form onSubmit={submit} noValidate className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
    <h2 className="text-xl font-black">Khóa slot hoặc bảo trì</h2>
    {mutation.isError && <ErrorBanner error={mutation.error} />}
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <Select label="Phạm vi" value={values.scope} onChange={(value) => change({ scope: value as LockScope })} options={SCOPES} />
      <Select label="Loại" value={values.type} onChange={(value) => change({ type: value as CourtLockType })} options={[{ value: 'OUT_OF_SERVICE', label: TYPE_LABELS.OUT_OF_SERVICE }, { value: 'PRIVATE_EVENT', label: TYPE_LABELS.PRIVATE_EVENT }]} />
      {errors.branchId && <p className="text-sm text-red-600 sm:col-span-2">{errors.branchId}</p>}
      <p className="text-xs text-slate-500 sm:col-span-2">Chi nhánh: {branches.find((branch) => branch.value === branchId)?.label}</p>
      {values.scope === 'court' && <Field label="Sân" error={errors.courtId} wide><select value={values.courtId} onChange={(event) => change({ courtId: event.target.value })} className={fieldClass(errors.courtId)}><option value="">Chọn sân</option>{courts.map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}</select></Field>}
      {values.scope === 'courts' && <Field label="Các sân" error={errors.courtIds} wide><div className="grid max-h-40 gap-1 overflow-y-auto rounded-xl border border-slate-200 p-2 sm:grid-cols-2">{courts.map((court) => <label key={court.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm"><input type="checkbox" checked={values.courtIds.includes(String(court.id))} onChange={() => toggleCourt(String(court.id))} className="size-4 accent-emerald-600" />{court.name}</label>)}</div></Field>}
      <Field label="Từ" error={errors.startAt}><input type="datetime-local" step={1800} value={values.startAt} onChange={(event) => change({ startAt: event.target.value })} className={fieldClass(errors.startAt)} /></Field>
      <Field label="Đến" error={errors.endAt}><input type="datetime-local" step={1800} value={values.endAt} onChange={(event) => change({ endAt: event.target.value })} className={fieldClass(errors.endAt)} /></Field>
      <Field label="Lý do (nội bộ)" error={errors.reason} wide><input value={values.reason} maxLength={500} onChange={(event) => change({ reason: event.target.value })} className={fieldClass(errors.reason)} /></Field>
      <Field label="Ghi chú nội bộ" error={errors.notes} wide optional><textarea value={values.notes} maxLength={1000} rows={2} onChange={(event) => change({ notes: event.target.value })} className={fieldClass(errors.notes)} /></Field>
      <Field label="Lý do hiển thị cho khách" error={errors.publicReason} wide optional><input value={values.publicReason} maxLength={500} onChange={(event) => change({ publicReason: event.target.value })} className={fieldClass(errors.publicReason)} /></Field>
      <Field label="Tên liên hệ" error={errors.contactName} optional><input value={values.contactName} maxLength={100} onChange={(event) => change({ contactName: event.target.value })} className={fieldClass(errors.contactName)} /></Field>
      <Field label="Số điện thoại liên hệ" error={errors.contactPhone} optional><input value={values.contactPhone} onChange={(event) => change({ contactPhone: event.target.value })} className={fieldClass(errors.contactPhone)} placeholder="+84901234567" /></Field>
    </div>
    <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} disabled={mutation.isPending} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Hủy</button><button type="submit" disabled={mutation.isPending} className="rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{mutation.isPending ? 'Đang khóa...' : 'Khóa'}</button></div>
  </form></div>
}

function Field({ label, error, wide, optional, children }: { label: string; error?: string; wide?: boolean; optional?: boolean; children: React.ReactNode }) {
  return <label className={`block space-y-2 ${wide ? 'sm:col-span-2' : ''}`}><span className="text-sm font-semibold text-slate-700">{label} {!optional && <span className="text-red-600">*</span>}</span>{children}{error && <span className="block text-sm text-red-600">{error}</span>}</label>
}
