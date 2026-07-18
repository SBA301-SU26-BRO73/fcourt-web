import { useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock3, Copy, Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { getCourts } from '@/services/court/court.api'
import { applyTimeSlotTemplates, deleteTimeSlotTemplate, getTimeSlotTemplates, getTimeSlotTemplatesByCourt } from '@/services/time-slot-template/time-slot-template.api'
import type { Court } from '@/types/court'
import { DAY_OF_WEEK_LABELS, type SortDirection, type TimeSlotSortField, type TimeSlotTemplate } from '@/types/time-slot-template'
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
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [sortField, setSortField] = useState<TimeSlotSortField>('dayOfWeek')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selectedCourtId, setSelectedCourtId] = useState(() => {
    const courtId = navigationState?.courtId
    return courtId ? String(courtId) : ''
  })
  const [pendingDelete, setPendingDelete] = useState<TimeSlotTemplate | null>(null)
  const [showApply, setShowApply] = useState(false)
  const [applyMessage, setApplyMessage] = useState('')

  const allQuery = useQuery({
    queryKey: ['time-slots', 'list', page, size, sortField, sortDirection],
    queryFn: () => getTimeSlotTemplates({ page, size, sortField, sortDirection }),
    placeholderData: keepPreviousData,
    enabled: !selectedCourtId,
  })
  const courtsQuery = useQuery({ queryKey: ['courts', 'time-slot-options'], queryFn: () => getCourts({ page: 0, size: 1000, sortField: 'name', sortDirection: 'asc' }) })
  const courtQuery = useQuery({
    queryKey: ['time-slots', 'court', selectedCourtId],
    queryFn: () => getTimeSlotTemplatesByCourt(Number(selectedCourtId)),
    enabled: Boolean(selectedCourtId),
    retry: false,
  })
  const deleteMutation = useMutation({
    mutationFn: deleteTimeSlotTemplate,
    onSuccess: async () => {
      if (!selectedCourtId && allQuery.data?.numberOfElements === 1 && page > 0) setPage((current) => current - 1)
      await queryClient.invalidateQueries({ queryKey: ['time-slots'] })
      setPendingDelete(null)
      navigate(location.pathname, {
        replace: true,
        state: {
          successMessage: 'Xóa khung giờ thành công.',
          courtId: selectedCourtId ? Number(selectedCourtId) : undefined,
          returnTo: navigationState?.returnTo,
          returnState: navigationState?.returnState,
        },
      })
    },
  })

  useEffect(() => {
    if (!successMessage) return
    const timeoutId = window.setTimeout(
      () =>
        navigate(location.pathname, {
          replace: true,
          state: {
            courtId: selectedCourtId ? Number(selectedCourtId) : undefined,
            returnTo: navigationState?.returnTo,
            returnState: navigationState?.returnState,
          },
        }),
      5000,
    )
    return () => window.clearTimeout(timeoutId)
  }, [location.pathname, navigate, navigationState?.returnState, navigationState?.returnTo, selectedCourtId, successMessage])

  const courtSlots = useMemo(() => [...(courtQuery.data ?? [])].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)), [courtQuery.data])
  const courtMap = new Map((courtsQuery.data?.content ?? []).map((court) => [court.id, court]))
  const selectedCourt = courtMap.get(Number(selectedCourtId))

  return <div className="min-h-screen bg-[#F5F6F8] text-[#111827]"><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    {navigationState?.returnTo && <Link to={navigationState.returnTo} state={navigationState.returnState} className="mb-4 inline-block text-sm font-bold text-[#059669]">← Quay lại</Link>}
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#10B981]">Time slot template</p><h1 className="mt-2 text-3xl font-black">Quản lý khung giờ mẫu</h1><p className="mt-2 text-sm text-slate-500">Xem toàn bộ hoặc chọn court để xem lịch theo ngày.</p></div><div className="flex gap-2"><button type="button" onClick={() => setShowApply(true)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-[#059669] hover:bg-emerald-50"><Copy className="size-4" />Apply template</button><Link to="/admin/time-slots/new" state={{ courtId: selectedCourtId ? Number(selectedCourtId) : undefined, returnTo: '/admin/time-slots', returnState: { courtId: selectedCourtId ? Number(selectedCourtId) : undefined, returnTo: navigationState?.returnTo, returnState: navigationState?.returnState } }} className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-3 text-sm font-bold text-white hover:bg-[#059669]"><Plus className="size-5" />Thêm khung giờ</Link></div></div>

    {successMessage && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{successMessage}</div>}
    {applyMessage && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{applyMessage}</div>}
    {deleteMutation.isError && <ErrorBanner error={deleteMutation.error} />}

    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-4">
      <Select label="View theo court" value={selectedCourtId} onChange={(value) => { setSelectedCourtId(value); setPage(0) }} options={[{ value: '', label: 'Tất cả court' }, ...(courtsQuery.data?.content ?? []).map((court) => ({ value: String(court.id), label: `${court.name} - ${court.branchName}` }))]} />
      {!selectedCourtId && <><Select label="Sắp xếp" value={sortField} onChange={(value) => { setSortField(value as TimeSlotSortField); setPage(0) }} options={[{ value: 'dayOfWeek', label: 'Ngày trong tuần' }, { value: 'startTime', label: 'Giờ bắt đầu' }, { value: 'price', label: 'Giá' }, { value: 'active', label: 'Trạng thái' }, { value: 'createdAt', label: 'Ngày tạo' }]} /><Select label="Thứ tự" value={sortDirection} onChange={(value) => { setSortDirection(value as SortDirection); setPage(0) }} options={[{ value: 'asc', label: 'Tăng dần' }, { value: 'desc', label: 'Giảm dần' }]} /><Select label="Số bản ghi" value={String(size)} onChange={(value) => { setSize(Number(value)); setPage(0) }} options={[5, 10, 20, 50].map((value) => ({ value: String(value), label: String(value) }))} /></>}
    </div></section>

    {selectedCourtId ? <CourtSchedule court={selectedCourt} slots={courtSlots} isLoading={courtQuery.isPending} error={courtQuery.error} returnState={{ courtId: Number(selectedCourtId), returnTo: navigationState?.returnTo, returnState: navigationState?.returnState }} onRetry={() => void courtQuery.refetch()} onDelete={setPendingDelete} /> : <AllSlotList data={allQuery.data} isLoading={allQuery.isPending} error={allQuery.error} returnState={{}} onRetry={() => void allQuery.refetch()} onDelete={setPendingDelete} />}

    {!selectedCourtId && allQuery.data && allQuery.data.totalPages > 1 && <div className="mt-8 flex items-center justify-between text-sm"><span>Tổng {allQuery.data.totalElements} khung giờ</span><div className="flex items-center gap-3"><button disabled={allQuery.data.first || allQuery.isFetching} onClick={() => setPage((current) => Math.max(0, current - 1))} className="rounded-xl border bg-white px-4 py-2.5 font-bold disabled:opacity-40">Trang trước</button><span>Trang {allQuery.data.number + 1}/{allQuery.data.totalPages}</span><button disabled={allQuery.data.last || allQuery.isFetching} onClick={() => setPage((current) => current + 1)} className="rounded-xl border bg-white px-4 py-2.5 font-bold disabled:opacity-40">Trang sau</button></div></div>}
  </main>
  {pendingDelete && <ConfirmDialog title={`Xóa khung giờ ${formatTime(pendingDelete.startTime)} - ${formatTime(pendingDelete.endTime)}?`} description="Đây là xóa mềm. Khung giờ sẽ biến mất và hiện chưa thể khôi phục." confirmLabel={deleteMutation.isPending ? 'Đang xóa...' : 'Xóa khung giờ'} isBusy={deleteMutation.isPending} onCancel={() => setPendingDelete(null)} onConfirm={() => deleteMutation.mutate(pendingDelete.id)} />}
  {showApply && <ApplyDialog courts={courtsQuery.data?.content ?? []} onClose={() => setShowApply(false)} onApplied={(message) => { setApplyMessage(message); setShowApply(false) }} />}
  </div>
}

function AllSlotList({ data, isLoading, error, returnState, onRetry, onDelete }: { data?: { content: TimeSlotTemplate[] }; isLoading: boolean; error: unknown; returnState: unknown; onRetry: () => void; onDelete: (slot: TimeSlotTemplate) => void }) {
  if (isLoading) return <State title="Đang tải danh sách khung giờ..." />
  if (error) return <State title="Không thể tải danh sách" description={getTimeSlotErrorMessage(error)} action={onRetry} />
  if (!data?.content.length) return <State title="Chưa có khung giờ mẫu" />
  return <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-200">{data.content.map((slot) => <SlotRow key={slot.id} slot={slot} returnState={returnState} onDelete={onDelete} />)}</div></div>
}

function CourtSchedule({ court, slots, isLoading, error, returnState, onRetry, onDelete }: { court?: Court; slots: TimeSlotTemplate[]; isLoading: boolean; error: unknown; returnState: unknown; onRetry: () => void; onDelete: (slot: TimeSlotTemplate) => void }) {
  if (isLoading) return <State title="Đang tải lịch court..." />
  if (error) return <State title="Không thể tải lịch court" description={getTimeSlotErrorMessage(error)} action={onRetry} />
  if (!slots.length) return <State title="Court chưa có khung giờ mẫu" />
  const groups = Object.entries(DAY_OF_WEEK_LABELS).map(([day, label]) => ({ day: Number(day), label, slots: slots.filter((slot) => slot.dayOfWeek === Number(day)) })).filter((group) => group.slots.length)
  return <section className="mt-6"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Lịch của {court?.name}</h2><Link to="/admin/time-slots/new" state={{ courtId: court?.id, returnTo: '/admin/time-slots', returnState }} className="text-sm font-bold text-[#059669]">+ Thêm khung giờ</Link></div><div className="mt-4 grid gap-5 lg:grid-cols-2">{groups.map((group) => <div key={group.day} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-black text-[#059669]">{group.label}</h3><div className="mt-3 divide-y divide-slate-100">{group.slots.map((slot) => <SlotRow key={slot.id} slot={slot} returnState={returnState} compact onDelete={onDelete} />)}</div></div>)}</div></section>
}

function SlotRow({ slot, compact, returnState, onDelete }: { slot: TimeSlotTemplate; compact?: boolean; returnState: unknown; onDelete: (slot: TimeSlotTemplate) => void }) {
  return <article className="flex flex-wrap items-center gap-4 px-5 py-4"><div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-[#059669]"><Clock3 className="size-5" /></div><div className="min-w-40 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${slot.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>{slot.active ? 'Active' : 'Inactive'}</span></div>{!compact && <><p className="mt-1 text-sm text-slate-500">{slot.courtName} · {DAY_OF_WEEK_LABELS[slot.dayOfWeek]}</p><p className="mt-1 text-xs text-slate-400">Tạo {formatDateTime(slot.createdAt)} · Cập nhật {formatDateTime(slot.updatedAt)}</p></>}<p className="mt-1 font-bold text-[#059669]">{slot.price.toLocaleString('vi-VN')}đ</p></div><div className="flex items-center gap-1"><Link to={`/admin/time-slots/${slot.id}`} state={{ returnTo: '/admin/time-slots', returnState }} className="grid size-9 place-items-center rounded-full text-slate-500 hover:bg-emerald-50 hover:text-[#059669]" title="Chi tiết"><Eye className="size-4" /></Link><Link to={`/admin/time-slots/${slot.id}/edit`} state={{ returnTo: '/admin/time-slots', returnState }} className="grid size-9 place-items-center rounded-full text-slate-500 hover:bg-emerald-50 hover:text-[#059669]" title="Chỉnh sửa"><Pencil className="size-4" /></Link><button onClick={() => onDelete(slot)} className="grid size-9 place-items-center rounded-full text-red-500 hover:bg-red-50" title="Xóa"><Trash2 className="size-4" /></button></div></article>
}

function ApplyDialog({ courts, onClose, onApplied }: { courts: Court[]; onClose: () => void; onApplied: (message: string) => void }) {
  const queryClient = useQueryClient()
  const [sourceId, setSourceId] = useState('')
  const [targetId, setTargetId] = useState('')
  const mutation = useMutation({ mutationFn: () => applyTimeSlotTemplates(Number(targetId), { sourceCourtId: Number(sourceId) }), onSuccess: async (result) => { await queryClient.invalidateQueries({ queryKey: ['time-slots'] }); onApplied(result.copiedCount === 0 ? 'Không có slot mới để copy.' : `Đã copy ${result.copiedCount} khung giờ sang court đích.`) } })
  const invalid = !sourceId || !targetId || sourceId === targetId
  return <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-black">Apply templates to court</h2><p className="mt-2 text-sm text-slate-600">Slot đã tồn tại sẽ được bỏ qua và không ghi đè giá hoặc trạng thái.</p>{mutation.isError && <ErrorBanner error={mutation.error} />}<div className="mt-5 grid gap-4"><Select label="Court nguồn" value={sourceId} onChange={setSourceId} options={[{ value: '', label: 'Chọn court nguồn' }, ...courts.map((court) => ({ value: String(court.id), label: `${court.name} - ${court.branchName}` }))]} /><Select label="Court đích" value={targetId} onChange={setTargetId} options={[{ value: '', label: 'Chọn court đích' }, ...courts.map((court) => ({ value: String(court.id), label: `${court.name} - ${court.branchName}` }))]} />{sourceId && sourceId === targetId && <p className="text-sm text-red-600">Court nguồn và đích phải khác nhau.</p>}</div><div className="mt-6 flex justify-end gap-3"><button onClick={onClose} disabled={mutation.isPending} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Hủy</button><button onClick={() => mutation.mutate()} disabled={invalid || mutation.isPending} className="rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{mutation.isPending ? 'Đang copy...' : 'Xác nhận apply'}</button></div></div></div>
}

function ConfirmDialog({ title, description, confirmLabel, isBusy, onCancel, onConfirm }: { title: string; description: string; confirmLabel: string; isBusy: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="grid size-12 place-items-center rounded-full bg-red-100 text-red-600"><Trash2 /></div><h2 className="mt-4 text-xl font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p><div className="mt-6 flex justify-end gap-3"><button onClick={onCancel} disabled={isBusy} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Hủy</button><button onClick={onConfirm} disabled={isBusy} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{confirmLabel}</button></div></div></div>
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return <label className="space-y-1.5 text-sm font-bold text-slate-700"><span className="block">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
}
function State({ title, description, action }: { title: string; description?: string; action?: () => void }) { return <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"><h2 className="text-lg font-bold">{title}</h2>{description && <p className="mt-2 text-sm text-slate-500">{description}</p>}{action && <button onClick={action} className="mt-4 rounded-xl bg-[#10B981] px-4 py-2 text-sm font-bold text-white">Thử lại</button>}</div> }
function ErrorBanner({ error }: { error: unknown }) { return <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{getTimeSlotErrorMessage(error)}</div> }
function formatTime(value: string) { return value.slice(0, 5) }
function formatDateTime(value: string) { return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) }
