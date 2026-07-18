import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import { getCourts } from '@/services/court/court.api'
import { createTimeSlotTemplate, getTimeSlotTemplateDetail, updateTimeSlotTemplate } from '@/services/time-slot-template/time-slot-template.api'
import type { TimeSlotTemplate } from '@/types/time-slot-template'
import { TimeSlotForm } from './time-slot-form'
import { getTimeSlotErrorCode, getTimeSlotErrorMessage, getTimeSlotFieldErrors } from './time-slot-error.utils'
import { emptyTimeSlotFormValues, timeSlotToFormValues, toCreateTimeSlotPayload, toUpdateTimeSlotPayload, validateTimeSlotForm, type TimeSlotFormErrors, type TimeSlotFormValues } from './time-slot-form.utils'

type NavigationState = {
  courtId?: number
  returnTo?: string
  returnState?: unknown
} | null

export function TimeSlotFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const location = useLocation()
  const state = location.state as NavigationState
  const id = Number(useParams().timeSlotId)
  const isEdit = mode === 'edit'
  const validId = Number.isInteger(id) && id > 0
  const detailQuery = useQuery({ queryKey: ['time-slots', 'detail', id], queryFn: () => getTimeSlotTemplateDetail(id), enabled: isEdit && validId, retry: false })

  if (!isEdit) return <TimeSlotEditor mode="create" initialCourtId={state?.courtId} returnTo={state?.returnTo} returnState={state?.returnState} />
  if (!validId) return <Navigate to="/admin/time-slots" replace />
  if (detailQuery.isPending) return <PageState title="Đang tải khung giờ..." />
  if (detailQuery.isError) return <PageState title={getTimeSlotErrorCode(detailQuery.error) === 'RESOURCE_NOT_FOUND' ? 'Không tìm thấy khung giờ' : 'Không thể tải khung giờ'} description={getTimeSlotErrorMessage(detailQuery.error)} />
  return <TimeSlotEditor key={detailQuery.data.id} mode="edit" slot={detailQuery.data} returnTo={state?.returnTo} returnState={state?.returnState} />
}

function TimeSlotEditor({ mode, slot, initialCourtId, returnTo, returnState }: { mode: 'create' | 'edit'; slot?: TimeSlotTemplate; initialCourtId?: number; returnTo?: string; returnState?: unknown }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = mode === 'edit'
  const [values, setValues] = useState<TimeSlotFormValues>(() => slot ? timeSlotToFormValues(slot) : { ...emptyTimeSlotFormValues, courtId: initialCourtId ? String(initialCourtId) : '' })
  const [errors, setErrors] = useState<TimeSlotFormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const courtsQuery = useQuery({ queryKey: ['courts', 'time-slot-options'], queryFn: () => getCourts({ page: 0, size: 1000, sortField: 'name', sortDirection: 'asc' }) })
  const mutation = useMutation({
    mutationFn: () => isEdit && slot ? updateTimeSlotTemplate(slot.id, toUpdateTimeSlotPayload(values)) : createTimeSlotTemplate(toCreateTimeSlotPayload(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['time-slots'] })
      navigate(returnTo ?? '/admin/time-slots', {
        replace: true,
        state: mergeNavigationState(returnState, {
          successMessage: isEdit
            ? 'Cập nhật khung giờ thành công.'
            : 'Tạo khung giờ thành công.',
        }),
      })
    },
    onError: (error) => { setErrors((current) => ({ ...current, ...getTimeSlotFieldErrors(error) })); setSubmitError(getTimeSlotErrorMessage(error)) },
  })

  function handleChange(field: keyof TimeSlotFormValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError('')
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateTimeSlotForm(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) mutation.mutate()
  }

  return <div className="min-h-screen bg-[#F5F6F8]"><main className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><Link to={returnTo ?? '/admin/time-slots'} state={returnState} className="text-sm font-bold text-[#059669]">← Quay lại</Link><div className="mb-8 mt-4"><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#10B981]">Time slot template</p><h1 className="mt-2 text-3xl font-black">{isEdit ? 'Chỉnh sửa khung giờ' : 'Thêm khung giờ mẫu'}</h1></div>{submitError && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</div>}<TimeSlotForm values={values} errors={errors} courts={courtsQuery.data?.content ?? []} isEdit={isEdit} isSubmitting={mutation.isPending || courtsQuery.isPending} onChange={handleChange} onSubmit={handleSubmit} /></main></div>
}

function mergeNavigationState(base: unknown, extra: Record<string, unknown>) {
  return typeof base === 'object' && base !== null ? { ...base, ...extra } : extra
}

function PageState({ title, description }: { title: string; description?: string }) {
  return <div className="px-4 py-20 text-center"><h1 className="text-2xl font-bold">{title}</h1>{description && <p className="mt-3 text-slate-600">{description}</p>}<Link to="/admin/time-slots" className="mt-6 inline-block rounded-xl border bg-white px-4 py-2 text-sm font-bold">Về danh sách</Link></div>
}
