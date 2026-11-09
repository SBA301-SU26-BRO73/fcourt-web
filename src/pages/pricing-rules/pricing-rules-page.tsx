import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Pencil, Plus, Trash2 } from 'lucide-react'

import { getCourts } from '@/services/court/court.api'
import { copyWeekdayToWeekend, createPricingRule, deletePricingRule, getPricingRules, updatePricingRule } from '@/services/pricing-rule/pricing-rule.api'
import { formatMoney, formatTime } from '@/pages/time-slots/schedule-format'
import { ConfirmDialog, ErrorBanner, ScheduleTabs, Select, State, SuccessBanner } from '@/pages/time-slots/schedule-ui'
import { getTimeSlotErrorMessage, getTimeSlotFieldErrors } from '@/pages/time-slots/time-slot-error.utils'
import { DAY_OF_WEEK_LABELS } from '@/types/time-slot-template'
import type { PricingRule } from '@/types/pricing-rule'
import {
  emptyPricingRuleFormValues,
  parseMultiplier,
  pricingRuleToFormValues,
  toPricingRuleRequest,
  validatePricingRuleForm,
  type PricingRuleFormErrors,
  type PricingRuleFormValues,
} from './pricing-rule-form.utils'

const fieldClass = (error?: string) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'}`

export function PricingRulesPage() {
  const queryClient = useQueryClient()
  const [chosenCourtId, setChosenCourtId] = useState('')
  const [editing, setEditing] = useState<PricingRule | 'new' | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PricingRule | null>(null)
  const [showCopy, setShowCopy] = useState(false)
  const [message, setMessage] = useState('')

  const courtsQuery = useQuery({ queryKey: ['courts', 'time-slot-options'], queryFn: () => getCourts({ page: 0, size: 1000, sortField: 'name', sortDirection: 'asc' }) })
  const courts = useMemo(() => courtsQuery.data?.content ?? [], [courtsQuery.data])
  const courtId = chosenCourtId || (courts[0] ? String(courts[0].id) : '')
  const rulesQuery = useQuery({ queryKey: ['pricing-rules', courtId], queryFn: () => getPricingRules(Number(courtId)), enabled: Boolean(courtId), retry: false })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['pricing-rules'] })

  const deleteMutation = useMutation({
    mutationFn: (rule: PricingRule) => deletePricingRule(rule.courtId, rule.id),
    onSuccess: async () => { await refresh(); setPendingDelete(null); setMessage('Đã xóa quy tắc giá.') },
  })

  const rules = useMemo(() => [...(rulesQuery.data ?? [])].sort((a, b) => a.startTime.localeCompare(b.startTime)), [rulesQuery.data])
  const weekday = rules.filter((rule) => rule.dayType === 'WEEKDAY')
  const weekend = rules.filter((rule) => rule.dayType === 'WEEKEND')

  return <div className="min-h-screen bg-[#F5F6F8] text-[#111827]"><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <ScheduleTabs />
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#10B981]">Pricing rules</p><h1 className="mt-2 text-3xl font-black">Giá theo khung giờ</h1><p className="mt-2 text-sm text-slate-500">Giờ cao điểm, giá ngày thường và cuối tuần. Quy tắc giá ghi đè giá của khung giờ mẫu.</p></div><div className="flex gap-2"><button type="button" onClick={() => setShowCopy(true)} disabled={!courtId || weekday.length === 0} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-[#059669] hover:bg-emerald-50 disabled:opacity-50"><Copy className="size-4" />Sao chép sang cuối tuần</button><button type="button" onClick={() => setEditing('new')} disabled={!courtId} className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-3 text-sm font-bold text-white hover:bg-[#059669] disabled:opacity-50"><Plus className="size-5" />Thêm quy tắc</button></div></div>

    {message && <SuccessBanner message={message} />}
    {deleteMutation.isError && <ErrorBanner error={deleteMutation.error} />}

    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-4">
      <Select label="Court" value={courtId} onChange={(value) => { setChosenCourtId(value); setMessage('') }} options={courts.length ? courts.map((court) => ({ value: String(court.id), label: `${court.name} - ${court.branchName}` })) : [{ value: '', label: courtsQuery.isPending ? 'Đang tải...' : 'Chưa có court' }]} />
    </div></section>

    {!courtId ? <State title={courtsQuery.isPending ? 'Đang tải danh sách court...' : 'Chưa có court nào'} /> : rulesQuery.isPending ? <State title="Đang tải quy tắc giá..." /> : rulesQuery.isError ? <State title="Không thể tải quy tắc giá" description={getTimeSlotErrorMessage(rulesQuery.error)} action={() => void rulesQuery.refetch()} /> : rules.length === 0 ? <State title="Court chưa có quy tắc giá" description="Chưa có quy tắc nào thì mọi slot dùng giá của khung giờ mẫu." /> : <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <RuleGroup title="Ngày thường" rules={weekday} onEdit={setEditing} onDelete={setPendingDelete} />
      <RuleGroup title="Cuối tuần" rules={weekend} onEdit={setEditing} onDelete={setPendingDelete} />
    </div>}
  </main>
  {editing && courtId && <RuleDialog key={editing === 'new' ? 'new' : editing.id} courtId={Number(courtId)} rule={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} onSaved={async () => { await refresh(); setEditing(null); setMessage('Đã lưu quy tắc giá.') }} />}
  {showCopy && courtId && <CopyDialog courtId={Number(courtId)} onClose={() => setShowCopy(false)} onCopied={async (count) => { await refresh(); setShowCopy(false); setMessage(`Đã sao chép sang cuối tuần, ${count} quy tắc.`) }} />}
  {pendingDelete && <ConfirmDialog title={`Xóa quy tắc "${pendingDelete.ruleName}"?`} description="Slot trong khung giờ này sẽ quay về giá của khung giờ mẫu." confirmLabel={deleteMutation.isPending ? 'Đang xóa...' : 'Xóa quy tắc'} isBusy={deleteMutation.isPending} onCancel={() => setPendingDelete(null)} onConfirm={() => deleteMutation.mutate(pendingDelete)} />}
  </div>
}

function RuleGroup({ title, rules, onEdit, onDelete }: { title: string; rules: PricingRule[]; onEdit: (rule: PricingRule) => void; onDelete: (rule: PricingRule) => void }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-black text-[#059669]">{title}</h2>{rules.length === 0 ? <p className="mt-3 text-sm text-slate-500">Chưa có quy tắc.</p> : <div className="mt-3 divide-y divide-slate-100">{rules.map((rule) => <article key={rule.id} className="flex flex-wrap items-center gap-4 py-4"><div className="min-w-40 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{rule.ruleName}</h3>{rule.peakHour && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">Cao điểm</span>}</div><p className="mt-1 text-sm text-slate-500">{formatTime(rule.startTime)} - {formatTime(rule.endTime)} · {rule.daysOfWeek.map((day) => DAY_OF_WEEK_LABELS[day]).join(', ')}</p><p className="mt-1 font-bold text-[#059669]">{formatMoney(rule.pricePerHour)}/giờ</p></div><div className="flex items-center gap-1"><button onClick={() => onEdit(rule)} className="grid size-9 place-items-center rounded-full text-slate-500 hover:bg-emerald-50 hover:text-[#059669]" title="Chỉnh sửa"><Pencil className="size-4" /></button><button onClick={() => onDelete(rule)} className="grid size-9 place-items-center rounded-full text-red-500 hover:bg-red-50" title="Xóa"><Trash2 className="size-4" /></button></div></article>)}</div>}</div>
}

function RuleDialog({ courtId, rule, onClose, onSaved }: { courtId: number; rule?: PricingRule; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState<PricingRuleFormValues>(() => rule ? pricingRuleToFormValues(rule) : emptyPricingRuleFormValues)
  const [errors, setErrors] = useState<PricingRuleFormErrors>({})
  const mutation = useMutation({
    mutationFn: () => {
      const payload = toPricingRuleRequest(values)
      return rule ? updatePricingRule(courtId, rule.id, payload) : createPricingRule(courtId, payload)
    },
    onSuccess: onSaved,
    onError: (error) => setErrors((current) => ({ ...current, ...getTimeSlotFieldErrors(error) as PricingRuleFormErrors })),
  })
  function change<K extends keyof PricingRuleFormValues>(field: K, value: PricingRuleFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = validatePricingRuleForm(values)
    setErrors(next)
    if (Object.keys(next).length === 0) mutation.mutate()
  }
  return <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 px-4 py-6"><form onSubmit={submit} noValidate className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
    <h2 className="text-xl font-black">{rule ? 'Chỉnh sửa quy tắc giá' : 'Thêm quy tắc giá'}</h2>
    {mutation.isError && <ErrorBanner error={mutation.error} />}
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <Field label="Tên quy tắc" error={errors.ruleName} wide><input value={values.ruleName} onChange={(event) => change('ruleName', event.target.value)} maxLength={100} className={fieldClass(errors.ruleName)} placeholder="Giờ vàng buổi tối" /></Field>
      <Field label="Giờ bắt đầu" error={errors.startTime}><input type="time" step={1800} value={values.startTime} onChange={(event) => change('startTime', event.target.value)} className={fieldClass(errors.startTime)} /></Field>
      <Field label="Giờ kết thúc" error={errors.endTime}><input type="time" step={1800} value={values.endTime} onChange={(event) => change('endTime', event.target.value)} className={fieldClass(errors.endTime)} /></Field>
      <Field label="Giá mỗi giờ" error={errors.pricePerHour}><input type="number" min="0.01" step="0.01" value={values.pricePerHour} onChange={(event) => change('pricePerHour', event.target.value)} className={fieldClass(errors.pricePerHour)} placeholder="180000" /></Field>
      <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><input type="checkbox" checked={values.peakHour} onChange={(event) => change('peakHour', event.target.checked)} className="size-4 accent-emerald-600" /><span className="text-sm font-bold">Giờ cao điểm</span></label>
      <Field label="Ngày áp dụng" error={errors.daysOfWeek} wide><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{Object.entries(DAY_OF_WEEK_LABELS).map(([day, label]) => { const checked = values.daysOfWeek.includes(day); return <label key={day} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"><input type="checkbox" checked={checked} onChange={() => change('daysOfWeek', checked ? values.daysOfWeek.filter((item) => item !== day) : [...values.daysOfWeek, day])} className="size-4 accent-emerald-600" />{label}</label> })}</div></Field>
    </div>
    <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} disabled={mutation.isPending} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Hủy</button><button type="submit" disabled={mutation.isPending} className="rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{mutation.isPending ? 'Đang lưu...' : 'Lưu quy tắc'}</button></div>
  </form></div>
}

function CopyDialog({ courtId, onClose, onCopied }: { courtId: number; onClose: () => void; onCopied: (count: number) => void }) {
  const [multiplier, setMultiplier] = useState('')
  const [error, setError] = useState('')
  const mutation = useMutation({ mutationFn: (value?: number) => copyWeekdayToWeekend(courtId, value), onSuccess: (rules) => onCopied(rules.length) })
  function confirm() {
    const parsed = parseMultiplier(multiplier)
    if (parsed.error) { setError(parsed.error); return }
    mutation.mutate(parsed.value)
  }
  return <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
    <h2 className="text-xl font-black">Sao chép giá ngày thường sang cuối tuần</h2>
    <p className="mt-2 text-sm text-slate-600">Các quy tắc cuối tuần hiện có sẽ bị thay thế bằng bản sao của quy tắc ngày thường.</p>
    {mutation.isError && <ErrorBanner error={mutation.error} />}
    <label className="mt-5 block space-y-1.5 text-sm font-bold text-slate-700"><span className="block">Hệ số giá (tùy chọn)</span><input type="number" min="0" step="0.01" value={multiplier} onChange={(event) => { setMultiplier(event.target.value); setError('') }} placeholder="Ví dụ 1.2 = tăng 20%" className={fieldClass(error)} />{error && <span className="block font-normal text-red-600">{error}</span>}</label>
    <div className="mt-6 flex justify-end gap-3"><button onClick={onClose} disabled={mutation.isPending} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Hủy</button><button onClick={confirm} disabled={mutation.isPending} className="rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{mutation.isPending ? 'Đang sao chép...' : 'Sao chép'}</button></div>
  </div></div>
}

function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`block space-y-2 ${wide ? 'sm:col-span-2' : ''}`}><span className="text-sm font-semibold text-slate-700">{label} <span className="text-red-600">*</span></span>{children}{error && <span className="block text-sm text-red-600">{error}</span>}</label>
}
