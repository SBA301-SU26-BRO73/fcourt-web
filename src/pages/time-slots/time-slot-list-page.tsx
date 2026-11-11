import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatLocalDate } from '@/common/utils/local-date'
import { CalendarDays, Clock3, Copy, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { getCourts } from '@/services/court/court.api'
import { branchApi, type DailySlotResponse } from '@/services/branch/branch.api'
import { deleteTimeSlotTemplate, getTimeSlotTemplatesByCourt } from '@/services/time-slot-template/time-slot-template.api'
import type { Court } from '@/types/court'
import { DAY_OF_WEEK_LABELS, type TimeSlotTemplate } from '@/types/time-slot-template'
import { BulkApplyDialog } from './bulk-apply-dialog'
import { formatMoney, formatTime } from './schedule-format'
import { ConfirmDialog, ErrorBanner, ScheduleTabs, Select, State, SuccessBanner } from './schedule-ui'
import { getTimeSlotErrorMessage } from './time-slot-error.utils'

type LocationState = {
  successMessage?: string
  courtId?: number
  returnTo?: string
  returnState?: unknown
} | null

export function TimeSlotListPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const navigationState = location.state as LocationState
  const successMessage = navigationState?.successMessage
  const [chosenCourtId, setChosenCourtId] = useState(() => navigationState?.courtId ? String(navigationState.courtId) : '')
  const [pendingDelete, setPendingDelete] = useState<TimeSlotTemplate | null>(null)
  const [showBulk, setShowBulk] = useState(false)
  const [applyMessage, setApplyMessage] = useState('')
  const [scheduleDate, setScheduleDate] = useState(() => formatLocalDate(new Date()))

  const courtsQuery = useQuery({ queryKey: ['courts', 'time-slot-options'], queryFn: () => getCourts({ page: 0, size: 1000, sortField: 'name', sortDirection: 'asc' }) })
  const courts = useMemo(() => courtsQuery.data?.content ?? [], [courtsQuery.data])
  // Templates only exist per court, so a court is always selected: the chosen one, else the first.
  const selectedCourtId = chosenCourtId || (courts[0] ? String(courts[0].id) : '')
  const courtQuery = useQuery({
    queryKey: ['time-slots', 'court', selectedCourtId],
    queryFn: () => getTimeSlotTemplatesByCourt(Number(selectedCourtId)),
    enabled: Boolean(selectedCourtId),
    retry: false,
  })
  const deleteMutation = useMutation({
    mutationFn: deleteTimeSlotTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['time-slots'] })
      setPendingDelete(null)
      navigate(location.pathname, {
        replace: true,
        state: { successMessage: 'Xóa khung giờ thành công.', courtId: Number(selectedCourtId), returnTo: navigationState?.returnTo, returnState: navigationState?.returnState },
      })
    },
  })

  useEffect(() => {
    if (!successMessage) return
    const timeoutId = window.setTimeout(
      () =>
        navigate(location.pathname, {
          replace: true,
          state: { courtId: selectedCourtId ? Number(selectedCourtId) : undefined, returnTo: navigationState?.returnTo, returnState: navigationState?.returnState },
        }),
      5000,
    )
    return () => window.clearTimeout(timeoutId)
  }, [location.pathname, navigate, navigationState?.returnState, navigationState?.returnTo, selectedCourtId, successMessage])

  const courtSlots = useMemo(() => [...(courtQuery.data ?? [])].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)), [courtQuery.data])
  const selectedCourt = courts.find((court) => String(court.id) === selectedCourtId)
  const dailyScheduleQuery = useQuery({
    queryKey: ['admin', 'daily-court-schedule', selectedCourtId, scheduleDate],
    queryFn: () => branchApi.getDailyCourtSchedule(Number(selectedCourtId), scheduleDate),
    enabled: Boolean(selectedCourtId),
    refetchInterval: 15000,
  })
  const rowState = { courtId: Number(selectedCourtId), returnTo: '/admin/time-slots', returnState: { courtId: Number(selectedCourtId), returnTo: navigationState?.returnTo, returnState: navigationState?.returnState } }

  return <div className="min-h-screen bg-[#F5F6F8] text-[#111827]"><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    {navigationState?.returnTo && <Link to={navigationState.returnTo} state={navigationState.returnState} className="mb-4 inline-block text-sm font-bold text-[#059669]">← Quay lại</Link>}
    <ScheduleTabs />
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#10B981]">Time slot template</p><h1 className="mt-2 text-3xl font-black">Quản lý khung giờ mẫu</h1><p className="mt-2 text-sm text-slate-500">Chọn court để xem lịch mẫu theo ngày và trạng thái slot thực tế.</p></div><div className="flex gap-2"><button type="button" onClick={() => setShowBulk(true)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-[#059669] hover:bg-emerald-50"><Copy className="size-4" />Áp dụng nhiều sân</button><Link to="/admin/time-slots/new" state={rowState} className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-3 text-sm font-bold text-white hover:bg-[#059669]"><Plus className="size-5" />Thêm khung giờ</Link></div></div>

    {successMessage && <SuccessBanner message={successMessage} />}
    {applyMessage && <SuccessBanner message={applyMessage} />}
    {deleteMutation.isError && <ErrorBanner error={deleteMutation.error} />}

    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-4">
      <Select label="Court" value={selectedCourtId} onChange={setChosenCourtId} options={courts.length ? courts.map((court) => ({ value: String(court.id), label: `${court.name} - ${court.branchName}` })) : [{ value: '', label: courtsQuery.isPending ? 'Đang tải...' : 'Chưa có court' }]} />
    </div></section>

    {!selectedCourtId ? <State title={courtsQuery.isPending ? 'Đang tải danh sách court...' : 'Chưa có court nào'} description={courtsQuery.isPending ? undefined : 'Tạo court trước khi cấu hình khung giờ mẫu.'} /> : <>
      <CourtSchedule court={selectedCourt} slots={courtSlots} isLoading={courtQuery.isPending} error={courtQuery.error} rowState={rowState} onRetry={() => void courtQuery.refetch()} onDelete={setPendingDelete} />
      <DailyCourtStatusBoard date={scheduleDate} onDateChange={setScheduleDate} slots={dailyScheduleQuery.data ?? []} isLoading={dailyScheduleQuery.isPending} error={dailyScheduleQuery.error} onRefresh={() => void dailyScheduleQuery.refetch()} />
    </>}
  </main>
  {pendingDelete && <ConfirmDialog title={`Xóa khung giờ ${formatTime(pendingDelete.startTime)} - ${formatTime(pendingDelete.endTime)}?`} description="Khung giờ sẽ biến mất khỏi lịch mẫu. Slot đã được đặt hoặc giữ không bị ảnh hưởng." confirmLabel={deleteMutation.isPending ? 'Đang xóa...' : 'Xóa khung giờ'} isBusy={deleteMutation.isPending} onCancel={() => setPendingDelete(null)} onConfirm={() => deleteMutation.mutate(pendingDelete.id)} />}
  {showBulk && <BulkApplyDialog courts={courts} onClose={() => setShowBulk(false)} onApplied={(message) => { setApplyMessage(message); setShowBulk(false) }} />}
  </div>
}

function DailyCourtStatusBoard({ date, onDateChange, slots, isLoading, error, onRefresh }: { date: string; onDateChange: (value: string) => void; slots: DailySlotResponse[]; isLoading: boolean; error: unknown; onRefresh: () => void }) {
  return <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#10B981]">Live schedule</p><h2 className="mt-1 text-2xl font-black">Trạng thái slot theo ngày</h2><p className="mt-1 text-sm text-slate-500">HOLDING tự cập nhật mỗi 15 giây để admin biết giờ đang được khách giữ.</p></div>
      <div className="flex items-center gap-2"><label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2"><CalendarDays className="size-4 text-[#059669]" /><input type="date" value={date} onChange={(event) => onDateChange(event.target.value)} className="text-sm font-semibold outline-none" /></label><button type="button" onClick={onRefresh} className="grid size-10 place-items-center rounded-xl border border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-600" title="Làm mới"><RefreshCw className="size-4" /></button></div>
    </div>
    <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold"><StatusLegend status="AVAILABLE" label="Trống" /><StatusLegend status="HOLDING" label="Đang giữ" /><StatusLegend status="BOOKED" label="Đã đặt" /><StatusLegend status="EXPIRED" label="Hết hạn" /></div>
    {isLoading ? <State title="Đang tải trạng thái slot..." /> : error ? <State title="Không thể tải trạng thái slot" description={getTimeSlotErrorMessage(error)} action={onRefresh} /> : !slots.length ? <State title="Chưa có slot trong ngày này" /> : <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{slots.map((slot) => <div key={`${slot.startTime}-${slot.endTime}`} className={`rounded-xl border px-4 py-3 ${statusClass(slot.status)}`}><div className="flex items-center justify-between gap-2"><span className="font-black">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span><span className="text-[11px] font-black uppercase">{statusLabel(slot.status)}</span></div><p className="mt-2 text-sm font-semibold">{formatMoney(slot.price)}</p></div>)}</div>}
  </section>
}

function StatusLegend({ status, label }: { status: DailySlotResponse['status']; label: string }) { return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${statusClass(status)}`}><span className="size-2 rounded-full bg-current" />{label}</span> }
function statusClass(status: DailySlotResponse['status']) { return status === 'HOLDING' ? 'border-amber-200 bg-amber-50 text-amber-800' : status === 'BOOKED' ? 'border-blue-200 bg-blue-50 text-blue-800' : status === 'EXPIRED' ? 'border-slate-200 bg-slate-100 text-slate-500' : 'border-emerald-200 bg-emerald-50 text-emerald-800' }
function statusLabel(status: DailySlotResponse['status']) { return status === 'HOLDING' ? 'Đang giữ' : status === 'BOOKED' ? 'Đã đặt' : status === 'EXPIRED' ? 'Hết hạn' : 'Trống' }

function CourtSchedule({ court, slots, isLoading, error, rowState, onRetry, onDelete }: { court?: Court; slots: TimeSlotTemplate[]; isLoading: boolean; error: unknown; rowState: unknown; onRetry: () => void; onDelete: (slot: TimeSlotTemplate) => void }) {
  if (isLoading) return <State title="Đang tải lịch court..." />
  if (error) return <State title="Không thể tải lịch court" description={getTimeSlotErrorMessage(error)} action={onRetry} />
  if (!slots.length) return <State title="Court chưa có khung giờ mẫu" description="Dùng nút Thêm khung giờ để sinh lịch mẫu cho court này." />
  const groups = Object.entries(DAY_OF_WEEK_LABELS).map(([day, label]) => ({ day: Number(day), label, slots: slots.filter((slot) => slot.dayOfWeek === Number(day)) })).filter((group) => group.slots.length)
  return <section className="mt-6"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Lịch của {court?.name}</h2><Link to="/admin/time-slots/new" state={rowState} className="text-sm font-bold text-[#059669]">+ Thêm khung giờ</Link></div><div className="mt-4 grid gap-5 lg:grid-cols-2">{groups.map((group) => <div key={group.day} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-black text-[#059669]">{group.label}</h3><div className="mt-3 divide-y divide-slate-100">{group.slots.map((slot) => <SlotRow key={slot.id} slot={slot} rowState={rowState} onDelete={onDelete} />)}</div></div>)}</div></section>
}

function SlotRow({ slot, rowState, onDelete }: { slot: TimeSlotTemplate; rowState: unknown; onDelete: (slot: TimeSlotTemplate) => void }) {
  return <article className="flex flex-wrap items-center gap-4 px-5 py-4"><div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-[#059669]"><Clock3 className="size-5" /></div><div className="min-w-40 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${slot.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>{slot.active ? 'Active' : 'Inactive'}</span></div><p className="mt-1 font-bold text-[#059669]">{formatMoney(slot.price)}</p></div><div className="flex items-center gap-1"><Link to={`/admin/time-slots/${slot.id}/edit?courtId=${slot.courtId}`} state={rowState} className="grid size-9 place-items-center rounded-full text-slate-500 hover:bg-emerald-50 hover:text-[#059669]" title="Chỉnh sửa"><Pencil className="size-4" /></Link><button onClick={() => onDelete(slot)} className="grid size-9 place-items-center rounded-full text-red-500 hover:bg-red-50" title="Xóa"><Trash2 className="size-4" /></button></div></article>
}
