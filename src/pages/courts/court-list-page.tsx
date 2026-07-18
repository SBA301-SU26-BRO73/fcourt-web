import { useEffect, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Eye, ImageOff, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { deleteCourt, getCourts } from '@/services/court/court.api'
import type { Court, CourtSortField, CourtStatus, SortDirection } from '@/types/court'
import { getCourtErrorMessage } from './court-error.utils'

type LocationState = { successMessage?: string } | null

const statusStyles: Record<CourtStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-slate-200 text-slate-700',
  MAINTENANCE: 'bg-amber-100 text-amber-800',
}

const statusLabels: Record<CourtStatus, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Ngừng hoạt động',
  MAINTENANCE: 'Bảo trì',
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

export function CourtListPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const successMessage = (location.state as LocationState)?.successMessage
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [sortField, setSortField] = useState<CourtSortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const courtQuery = useQuery({
    queryKey: ['courts', 'list', page, size, sortField, sortDirection],
    queryFn: () => getCourts({ page, size, sortField, sortDirection }),
    placeholderData: keepPreviousData,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCourt,
    onSuccess: async () => {
      const isLastItem = courtQuery.data?.numberOfElements === 1 && page > 0
      if (isLastItem) setPage((current) => current - 1)
      await queryClient.invalidateQueries({ queryKey: ['courts'] })
      navigate(location.pathname, { replace: true, state: { successMessage: 'Xóa sân thành công.' } })
    },
  })

  useEffect(() => {
    if (!successMessage) return
    const timeoutId = window.setTimeout(() => navigate(location.pathname, { replace: true, state: null }), 5000)
    return () => window.clearTimeout(timeoutId)
  }, [location.pathname, navigate, successMessage])

  function handleDelete(court: Court) {
    const confirmed = window.confirm(`Xóa mềm sân "${court.name}"? Sân sẽ biến mất khỏi danh sách và hiện chưa thể khôi phục.`)
    if (confirmed) deleteMutation.mutate(court.id)
  }

  const data = courtQuery.data

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#111827]">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#10B981]">Court management</p>
            <h1 className="mt-2 text-[32px] font-bold tracking-tight">Quản lý sân</h1>
            <p className="mt-2 text-sm text-[#6B7280]">Quản lý sân ở tất cả branch, loại sân và trạng thái vận hành.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/time-slots" className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-[#059669] hover:bg-emerald-50">Khung giờ</Link>
            <Link to="/admin/branches" className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#374151] hover:border-[#10B981] hover:text-[#059669]">Quản lý branch</Link>
            <Link to="/admin/courts/new" className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#059669]">
              <Plus className="size-5" aria-hidden="true" /> Thêm sân
            </Link>
          </div>
        </div>

        {successMessage && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{successMessage}</div>}
        {deleteMutation.isError && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{getCourtErrorMessage(deleteMutation.error)}</div>}

        <section className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm" aria-label="Sắp xếp danh sách sân">
          <div className="grid gap-3 sm:grid-cols-3">
            <FilterSelect label="Sắp xếp theo" value={sortField} onChange={(value) => { setSortField(value as CourtSortField); setPage(0) }} options={[
              { value: 'name', label: 'Tên sân' },
              { value: 'status', label: 'Trạng thái' },
              { value: 'createdAt', label: 'Ngày tạo' },
              { value: 'updatedAt', label: 'Ngày cập nhật' },
              { value: 'id', label: 'ID' },
            ]} />
            <FilterSelect label="Thứ tự" value={sortDirection} onChange={(value) => { setSortDirection(value as SortDirection); setPage(0) }} options={[
              { value: 'asc', label: 'Tăng dần' },
              { value: 'desc', label: 'Giảm dần' },
            ]} />
            <FilterSelect label="Số sân mỗi trang" value={String(size)} onChange={(value) => { setSize(Number(value)); setPage(0) }} options={[5, 10, 20, 50].map((value) => ({ value: String(value), label: String(value) }))} />
          </div>
        </section>

        {courtQuery.isPending ? (
          <StatePanel title="Đang tải danh sách sân..." />
        ) : courtQuery.isError ? (
          <StatePanel title="Không thể tải danh sách sân" description={getCourtErrorMessage(courtQuery.error)} actionLabel="Thử lại" onAction={() => void courtQuery.refetch()} />
        ) : !data || data.content.length === 0 ? (
          <StatePanel title="Chưa có dữ liệu sân" description="Tạo sân đầu tiên để bắt đầu quản lý." />
        ) : (
          <>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {data.content.map((court) => (
                <article key={court.id} className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#10B981] hover:shadow-md">
                  <CourtImage court={court} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-bold">{court.name}</h2>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6B7280]"><MapPin className="size-4 text-[#10B981]" aria-hidden="true" />{court.branchName}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[court.status]}`}>{statusLabels[court.status]}</span>
                    </div>
                    <div className="mt-4 rounded-xl bg-[#F5F6F8] px-3 py-2.5 text-sm"><span className="text-[#6B7280]">Court type: </span><span className="font-semibold">{court.courtTypeName}</span></div>
                    <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-[#6B7280]">{court.description || 'Chưa có mô tả.'}</p>
                    <div className="mt-4 space-y-1 text-xs text-[#6B7280]">
                      <p className="flex items-center gap-2"><CalendarDays className="size-3.5" aria-hidden="true" />Tạo: {formatDateTime(court.createdAt)}</p>
                      <p className="pl-[22px]">Cập nhật: {formatDateTime(court.updatedAt)}</p>
                    </div>
                    <div className="mt-5 flex gap-2 border-t border-[#E5E7EB] pt-4">
                      <ActionLink to={`/admin/courts/${court.id}`} label="Chi tiết" icon={Eye} />
                      <ActionLink to={`/admin/courts/${court.id}/edit`} label="Sửa" icon={Pencil} />
                      <button type="button" disabled={deleteMutation.isPending} onClick={() => handleDelete(court)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 className="size-4" aria-hidden="true" />Xóa</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-[#6B7280]">
              <span>Tổng {data.totalElements} sân</span>
              <div className="flex items-center gap-3">
                <button type="button" disabled={data.first || courtQuery.isFetching} onClick={() => setPage((current) => Math.max(0, current - 1))} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 font-semibold text-[#111827] hover:border-[#10B981] disabled:opacity-40">Trang trước</button>
                <span className="font-medium">Trang {data.number + 1}/{Math.max(data.totalPages, 1)}</span>
                <button type="button" disabled={data.last || courtQuery.isFetching} onClick={() => setPage((current) => current + 1)} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 font-semibold text-[#111827] hover:border-[#10B981] disabled:opacity-40">Trang sau</button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function CourtImage({ court }: { court: Court }) {
  const [failed, setFailed] = useState(false)
  if (!court.imageUrl || failed) return <div className="grid h-44 place-items-center bg-emerald-50 text-emerald-300"><ImageOff className="size-12" aria-label="Không có ảnh sân" /></div>
  return <img src={court.imageUrl} alt={court.name} className="h-44 w-full bg-slate-100 object-cover" onError={() => setFailed(true)} />
}

function ActionLink({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Eye }) {
  return <Link to={to} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-bold text-[#059669] hover:bg-emerald-50"><Icon className="size-4" aria-hidden="true" />{label}</Link>
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return <label className="space-y-1.5 text-sm font-semibold text-[#374151]"><span className="block">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 font-normal outline-none focus:border-[#10B981] focus:ring-4 focus:ring-emerald-100">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
}

function StatePanel({ title, description, actionLabel, onAction }: { title: string; description?: string; actionLabel?: string; onAction?: () => void }) {
  return <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white px-6 py-16 text-center shadow-sm"><h2 className="text-lg font-bold">{title}</h2>{description && <p className="mx-auto mt-2 max-w-lg text-sm text-[#6B7280]">{description}</p>}{actionLabel && onAction && <button type="button" onClick={onAction} className="mt-5 rounded-xl bg-[#10B981] px-4 py-2 text-sm font-bold text-white hover:bg-[#059669]">{actionLabel}</button>}</div>
}
