import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clock3, Pencil, WalletCards } from 'lucide-react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'

import { getTimeSlotTemplateDetail } from '@/services/time-slot-template/time-slot-template.api'
import { DAY_OF_WEEK_LABELS } from '@/types/time-slot-template'
import { getTimeSlotErrorCode, getTimeSlotErrorMessage } from './time-slot-error.utils'

export function TimeSlotDetailPage() {
  const location = useLocation()
  const navigationState = location.state as {
    returnTo?: string
    returnState?: unknown
  } | null
  const id = Number(useParams().timeSlotId)
  const validId = Number.isInteger(id) && id > 0
  const query = useQuery({ queryKey: ['time-slots', 'detail', id], queryFn: () => getTimeSlotTemplateDetail(id), enabled: validId, retry: false })
  if (!validId) return <Navigate to="/admin/time-slots" replace />
  if (query.isPending) return <PageState title="Đang tải khung giờ..." />
  if (query.isError) return <PageState title={getTimeSlotErrorCode(query.error) === 'RESOURCE_NOT_FOUND' ? 'Không tìm thấy khung giờ' : 'Không thể tải khung giờ'} description={getTimeSlotErrorMessage(query.error)} />
  const slot = query.data
  return <div className="min-h-screen bg-[#F5F6F8]"><main className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><div className="flex items-center justify-between"><Link to={navigationState?.returnTo ?? '/admin/time-slots'} state={navigationState?.returnState} className="text-sm font-bold text-[#059669]">← Quay lại</Link><Link to={`/admin/time-slots/${slot.id}/edit`} state={{ returnTo: `/admin/time-slots/${slot.id}`, returnState: navigationState }} className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-bold text-white"><Pencil className="size-4" />Chỉnh sửa</Link></div><article className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#10B981]">Template #{slot.id}</p><h1 className="mt-2 text-3xl font-black">{slot.courtName}</h1></div><span className={`rounded-full px-3 py-1.5 text-sm font-bold ${slot.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>{slot.active ? 'Active' : 'Inactive'}</span></div><div className="mt-7 grid gap-4 sm:grid-cols-2"><Info icon={CalendarDays} label="Ngày" value={DAY_OF_WEEK_LABELS[slot.dayOfWeek]} /><Info icon={Clock3} label="Khung giờ" value={`${slot.startTime.slice(0, 5)} - ${slot.endTime.slice(0, 5)}`} /><Info icon={WalletCards} label="Giá" value={`${slot.price.toLocaleString('vi-VN')}đ`} /><Info icon={CalendarDays} label="Cập nhật" value={new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(slot.updatedAt))} /></div></article></main></div>
}

function Info({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) { return <div className="flex gap-3 rounded-2xl bg-slate-50 p-4"><Icon className="mt-0.5 size-5 text-[#10B981]" /><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div></div> }
function PageState({ title, description }: { title: string; description?: string }) { return <div className="px-4 py-20 text-center"><h1 className="text-2xl font-bold">{title}</h1>{description && <p className="mt-3 text-slate-600">{description}</p>}<Link to="/admin/time-slots" className="mt-6 inline-block rounded-xl border bg-white px-4 py-2 text-sm font-bold">Về danh sách</Link></div> }
