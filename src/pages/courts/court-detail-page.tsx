import { useQuery } from '@tanstack/react-query'
import { CalendarDays, ImageOff, MapPin, Pencil, Shapes } from 'lucide-react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'

import { getCourtDetail } from '@/services/court/court.api'
import type { CourtStatus } from '@/types/court'
import { getCourtErrorCode, getCourtErrorMessage } from './court-error.utils'

const statusLabels: Record<CourtStatus, string> = { ACTIVE: 'Hoạt động', INACTIVE: 'Ngừng hoạt động', MAINTENANCE: 'Bảo trì' }
const statusStyles: Record<CourtStatus, string> = { ACTIVE: 'bg-emerald-100 text-emerald-700', INACTIVE: 'bg-slate-200 text-slate-700', MAINTENANCE: 'bg-amber-100 text-amber-800' }

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value))
}

export function CourtDetailPage() {
  const location = useLocation()
  const navigationState = location.state as {
    returnTo?: string
    selectedBranchId?: number
    focusCourtId?: number
  } | null
  const returnTo = navigationState?.returnTo ?? '/admin/courts'
  const courtId = Number(useParams().courtId)
  const hasValidId = Number.isInteger(courtId) && courtId > 0
  const courtQuery = useQuery({ queryKey: ['courts', 'detail', courtId], queryFn: () => getCourtDetail(courtId), enabled: hasValidId, retry: false })

  if (!hasValidId) return <Navigate to="/admin/courts" replace />
  if (courtQuery.isPending) return <PageState title="Đang tải thông tin sân..." />
  if (courtQuery.isError) return <PageState title={getCourtErrorCode(courtQuery.error) === 'RESOURCE_NOT_FOUND' ? 'Không tìm thấy sân' : 'Không thể tải thông tin sân'} description={getCourtErrorMessage(courtQuery.error)} />

  const court = courtQuery.data
  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to={returnTo}
            state={{
              selectedBranchId: navigationState?.selectedBranchId,
              focusCourtId: navigationState?.focusCourtId ?? court.id,
            }}
            className="text-sm font-semibold text-[#059669] hover:text-[#047857]"
          >
            Quay lại
          </Link>
          <Link
            to={`/admin/courts/${court.id}/edit`}
            state={{
              ...navigationState,
              focusCourtId: navigationState?.focusCourtId ?? court.id,
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#059669]"
          >
            <Pencil className="size-4" aria-hidden="true" />Chỉnh sửa
          </Link>
        </div>

        <div className="mt-4 flex justify-end">
          <Link
            to="/admin/time-slots"
            state={{ courtId: court.id }}
            className="rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-[#059669] hover:bg-emerald-50"
          >
            Quản lý khung giờ
          </Link>
        </div>

        <article className="mt-6 overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
          {court.imageUrl ? <img src={court.imageUrl} alt={court.name} className="h-72 w-full bg-slate-100 object-cover" onError={(event) => { event.currentTarget.style.display = 'none' }} /> : <div className="grid h-56 place-items-center bg-emerald-50 text-emerald-300"><ImageOff className="size-14" aria-label="Không có ảnh sân" /></div>}
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#10B981]">Court #{court.id}</p><h1 className="mt-2 text-3xl font-black tracking-tight">{court.name}</h1></div>
              <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${statusStyles[court.status]}`}>{statusLabels[court.status]}</span>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Info icon={MapPin} label="Branch" value={court.branchName} />
              <Info icon={Shapes} label="Court type" value={`${court.courtTypeName} (ID: ${court.courtTypeId})`} />
              <Info icon={CalendarDays} label="Ngày tạo" value={formatDateTime(court.createdAt)} />
              <Info icon={CalendarDays} label="Cập nhật gần nhất" value={formatDateTime(court.updatedAt)} />
            </div>
            <div className="mt-7 border-t border-[#E5E7EB] pt-6"><h2 className="font-bold">Mô tả</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#6B7280]">{court.description || 'Chưa có mô tả.'}</p></div>
          </div>
        </article>
      </main>
    </div>
  )
}

function Info({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return <div className="flex gap-3 rounded-2xl bg-[#F5F6F8] p-4"><Icon className="mt-0.5 size-5 shrink-0 text-[#10B981]" aria-hidden="true" /><div><p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">{label}</p><p className="mt-1 font-semibold">{value}</p></div></div>
}

function PageState({ title, description }: { title: string; description?: string }) {
  return <div className="mx-auto max-w-3xl px-4 py-20 text-center"><h1 className="text-2xl font-bold">{title}</h1>{description && <p className="mt-3 text-slate-600">{description}</p>}<Link to="/admin/courts" className="mt-6 inline-block rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700">Về danh sách</Link></div>
}
