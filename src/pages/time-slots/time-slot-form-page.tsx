import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { getCourts } from '@/services/court/court.api'
import {
  applyTimeSlotTemplate,
  createTimeSlotTemplate,
  getTimeSlotTemplatesByCourt,
  previewTimeSlotTemplate,
  updateTimeSlotTemplate,
} from '@/services/time-slot-template/time-slot-template.api'
import { DAY_OF_WEEK_LABELS, type TemplatePreviewResponse, type TimeSlotTemplate } from '@/types/time-slot-template'
import { TimeSlotForm } from './time-slot-form'
import { getTimeSlotErrorMessage, getTimeSlotFieldErrors } from './time-slot-error.utils'
import {
  emptyTimeSlotFormValues,
  timeSlotToFormValues,
  toApplyPayload,
  toCreateTimeSlotPayload,
  toUpdateTimeSlotPayload,
  validateTimeSlotForm,
  type TimeSlotFormErrors,
  type TimeSlotFormValues,
} from './time-slot-form.utils'

type NavigationState = {
  courtId?: number
  returnTo?: string
  returnState?: unknown
} | null

export function TimeSlotFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const state = location.state as NavigationState
  const id = Number(useParams().timeSlotId)
  const isEdit = mode === 'edit'
  const validId = Number.isInteger(id) && id > 0
  // There is no get-by-id: the template is found in the list of its court (`?courtId=`).
  const editCourtId = Number(searchParams.get('courtId') ?? state?.courtId)
  const validCourt = Number.isInteger(editCourtId) && editCourtId > 0
  const listQuery = useQuery({
    queryKey: ['time-slots', 'court', String(editCourtId)],
    queryFn: () => getTimeSlotTemplatesByCourt(editCourtId),
    enabled: isEdit && validId && validCourt,
    retry: false,
  })

  if (!isEdit) return <TimeSlotEditor mode="create" initialCourtId={state?.courtId} returnTo={state?.returnTo} returnState={state?.returnState} />
  if (!validId || !validCourt) return <Navigate to="/admin/time-slots" replace />
  if (listQuery.isPending) return <PageState title="Đang tải khung giờ..." />
  if (listQuery.isError) return <PageState title="Không thể tải khung giờ" description={getTimeSlotErrorMessage(listQuery.error)} />
  const slot = listQuery.data.find((item) => item.id === id)
  if (!slot) return <PageState title="Không tìm thấy khung giờ" />
  return <TimeSlotEditor key={slot.id} mode="edit" slot={slot} returnTo={state?.returnTo} returnState={state?.returnState} />
}

function TimeSlotEditor({ mode, slot, initialCourtId, returnTo, returnState }: { mode: 'create' | 'edit'; slot?: TimeSlotTemplate; initialCourtId?: number; returnTo?: string; returnState?: unknown }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = mode === 'edit'
  const [values, setValues] = useState<TimeSlotFormValues>(() => slot ? timeSlotToFormValues(slot) : { ...emptyTimeSlotFormValues, courtId: initialCourtId ? String(initialCourtId) : '' })
  const [errors, setErrors] = useState<TimeSlotFormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [preview, setPreview] = useState<TemplatePreviewResponse | null>(null)
  const courtsQuery = useQuery({ queryKey: ['courts', 'time-slot-options'], queryFn: () => getCourts({ page: 0, size: 1000, sortField: 'name', sortDirection: 'asc' }) })
  const isRange = !isEdit && values.mode === 'range'

  const mutation = useMutation({
    mutationFn: async () => {
      const courtId = Number(values.courtId)
      if (isEdit && slot) return updateTimeSlotTemplate(slot.id, toUpdateTimeSlotPayload(values))
      if (isRange) return applyTimeSlotTemplate(courtId, toApplyPayload(values))
      // One request per day, in order: the first failure stops the rest.
      for (const day of values.dayOfWeeks.map(Number).sort((a, b) => a - b)) {
        await createTimeSlotTemplate(courtId, toCreateTimeSlotPayload(values, day))
      }
      return null
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['time-slots'] })
      navigate(returnTo ?? '/admin/time-slots', {
        replace: true,
        state: mergeNavigationState(returnState, {
          courtId: Number(values.courtId),
          successMessage: isEdit ? 'Cập nhật khung giờ thành công.' : isRange ? 'Đã áp dụng khung giờ mẫu.' : 'Tạo khung giờ thành công.',
        }),
      })
    },
    onError: (error) => { setErrors((current) => ({ ...current, ...getTimeSlotFieldErrors(error) })); setSubmitError(getTimeSlotErrorMessage(error)) },
  })
  const previewMutation = useMutation({
    mutationFn: () => previewTimeSlotTemplate(Number(values.courtId), toApplyPayload(values)),
    onSuccess: setPreview,
    onError: (error) => { setPreview(null); setSubmitError(getTimeSlotErrorMessage(error)) },
  })

  function handleChange(field: keyof TimeSlotFormValues, value: string | string[]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError('')
    setPreview(null)
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateTimeSlotForm(values, isEdit)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) mutation.mutate()
  }
  function handlePreview() {
    const nextErrors = validateTimeSlotForm(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) previewMutation.mutate()
  }

  return <div className="min-h-screen bg-[#F5F6F8]"><main className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><Link to={returnTo ?? '/admin/time-slots'} state={returnState} className="text-sm font-bold text-[#059669]">← Quay lại</Link><div className="mb-8 mt-4"><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#10B981]">Time slot template</p><h1 className="mt-2 text-3xl font-black">{isEdit ? 'Chỉnh sửa khung giờ' : 'Thêm khung giờ mẫu'}</h1></div>{submitError && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</div>}
    <TimeSlotForm values={values} errors={errors} courts={courtsQuery.data?.content ?? []} isEdit={isEdit} isSubmitting={mutation.isPending || courtsQuery.isPending} onChange={handleChange} onSubmit={handleSubmit}>
      {isRange && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Xem trước</h2><p className="mt-1 text-sm text-amber-700">Áp dụng sẽ thay thế toàn bộ khung giờ mẫu hiện có của các ngày đã chọn ({values.dayOfWeeks.map((day) => DAY_OF_WEEK_LABELS[Number(day)]).join(', ') || 'chưa chọn ngày'}).</p></div><button type="button" onClick={handlePreview} disabled={previewMutation.isPending} className="rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-[#059669] hover:bg-emerald-50 disabled:opacity-60">{previewMutation.isPending ? 'Đang tạo...' : 'Xem trước slot'}</button></div>
        {preview && <div className="mt-4"><p className="text-sm font-semibold text-slate-700">{preview.totalSlots} slot mỗi ngày</p><div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">{preview.slots.map((item) => <div key={item.startTime} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm"><span className="font-bold">{item.startTime} - {item.endTime}</span><span className="block text-emerald-700">{item.price.toLocaleString('vi-VN')}đ</span></div>)}</div></div>}
      </section>}
    </TimeSlotForm></main></div>
}

function mergeNavigationState(base: unknown, extra: Record<string, unknown>) {
  return typeof base === 'object' && base !== null ? { ...base, ...extra } : extra
}

function PageState({ title, description }: { title: string; description?: string }) {
  return <div className="px-4 py-20 text-center"><h1 className="text-2xl font-bold">{title}</h1>{description && <p className="mt-3 text-slate-600">{description}</p>}<Link to="/admin/time-slots" className="mt-6 inline-block rounded-xl border bg-white px-4 py-2 text-sm font-bold">Về danh sách</Link></div>
}
