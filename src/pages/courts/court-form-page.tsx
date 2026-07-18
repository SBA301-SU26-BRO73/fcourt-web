import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import { useCourtTypes } from '@/hooks/use-court-types'
import { getBranches } from '@/services/branch/branch.api'
import { createCourt, getCourtDetail, updateCourt } from '@/services/court/court.api'
import type { CourtTypeData } from '@/types/admin'
import type { Court } from '@/types/court'
import { CourtForm } from './court-form'
import { getCourtErrorCode, getCourtErrorMessage, getCourtFieldErrors } from './court-error.utils'
import {
  courtToFormValues,
  emptyCourtFormValues,
  toCreateCourtPayload,
  toUpdateCourtPayload,
  validateCourtForm,
  type CourtFormErrors,
  type CourtFormValues,
} from './court-form.utils'

type CourtFormPageProps = { mode: 'create' | 'edit' }
type CourtNavigationState = {
  returnTo?: string
  selectedBranchId?: number
  focusCourtId?: number
} | null

export function CourtFormPage({ mode }: CourtFormPageProps) {
  const location = useLocation()
  const navigationState = location.state as CourtNavigationState
  const params = useParams()
  const courtId = Number(params.courtId)
  const isEdit = mode === 'edit'
  const hasValidId = Number.isInteger(courtId) && courtId > 0

  const detailQuery = useQuery({
    queryKey: ['courts', 'detail', courtId],
    queryFn: () => getCourtDetail(courtId),
    enabled: isEdit && hasValidId,
    retry: false,
  })

  if (!isEdit) {
    return (
      <CourtEditor
        mode="create"
        returnTo={navigationState?.returnTo}
        selectedBranchId={navigationState?.selectedBranchId}
        focusCourtId={navigationState?.focusCourtId}
      />
    )
  }
  if (!hasValidId) return <Navigate to="/admin/courts" replace />
  if (detailQuery.isPending) return <PageMessage title="Đang tải thông tin sân..." />
  if (detailQuery.isError) {
    const notFound = getCourtErrorCode(detailQuery.error) === 'RESOURCE_NOT_FOUND'
    return (
      <PageMessage
        title={notFound ? 'Không tìm thấy sân' : 'Không thể tải thông tin sân'}
        description={getCourtErrorMessage(detailQuery.error)}
        actionLabel={notFound ? undefined : 'Thử lại'}
        onAction={notFound ? undefined : () => void detailQuery.refetch()}
      />
    )
  }
  return (
    <CourtEditor
      key={detailQuery.data.id}
      mode="edit"
      court={detailQuery.data}
      returnTo={navigationState?.returnTo}
      selectedBranchId={navigationState?.selectedBranchId}
      focusCourtId={navigationState?.focusCourtId}
    />
  )
}

function CourtEditor({
  mode,
  court,
  returnTo,
  selectedBranchId,
  focusCourtId,
}: {
  mode: 'create' | 'edit'
  court?: Court
  returnTo?: string
  selectedBranchId?: number
  focusCourtId?: number
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = mode === 'edit'
  const [values, setValues] = useState<CourtFormValues>(() =>
    court
      ? courtToFormValues(court)
      : {
          ...emptyCourtFormValues,
          branchId: selectedBranchId ? String(selectedBranchId) : '',
        },
  )
  const [errors, setErrors] = useState<CourtFormErrors>({})
  const [submitError, setSubmitError] = useState('')

  const branchesQuery = useQuery({
    queryKey: ['branches', 'court-form-options'],
    queryFn: () => getBranches({ page: 0, size: 100, sortField: 'name', sortDirection: 'asc' }),
  })
  const courtTypesQuery = useCourtTypes()

  const mutation = useMutation({
    mutationFn: () => isEdit && court
      ? updateCourt(court.id, toUpdateCourtPayload(values))
      : createCourt(toCreateCourtPayload(values)),
    onSuccess: async (savedCourt) => {
      await queryClient.invalidateQueries({ queryKey: ['courts'] })
      navigate(returnTo ?? '/admin/courts', {
        replace: true,
        state: {
          successMessage: isEdit ? 'Cập nhật sân thành công.' : 'Tạo sân thành công.',
          selectedBranchId,
          focusCourtId: focusCourtId ?? savedCourt.id,
        },
      })
    },
    onError: (error) => {
      setErrors((current) => ({ ...current, ...getCourtFieldErrors(error) }))
      setSubmitError(getCourtErrorMessage(error))
    },
  })

  function handleChange(field: keyof CourtFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateCourtForm(values)
    setErrors(nextErrors)
    setSubmitError('')
    if (Object.keys(nextErrors).length === 0) mutation.mutate()
  }

  const activeBranches = (branchesQuery.data?.content ?? [])
    .filter((branch) => branch.status === 'ACTIVE')
    .map(({ id, name, status }) => ({ id, name, status }))
  if (court && !activeBranches.some((branch) => branch.id === court.branchId)) {
    activeBranches.push({
      id: court.branchId,
      name: court.branchName,
      status: 'ACTIVE',
    })
  }
  const courtTypes = courtTypesQuery.data?.data?.content ?? []
  const selectableCourtTypes = courtTypes.filter((courtType) => (
    courtType.active || String(courtType.id) === values.courtTypeId
  ))
  if (court && !selectableCourtTypes.some((courtType) => courtType.id === court.courtTypeId)) {
    const currentCourtType: CourtTypeData = {
      id: court.courtTypeId,
      name: court.courtTypeName,
      nameEn: null,
      description: null,
      icon: null,
      color: null,
      active: false,
      createdAt: court.createdAt,
    }
    selectableCourtTypes.push(currentCourtType)
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to={returnTo ?? '/admin/courts'}
          state={{ selectedBranchId, focusCourtId: focusCourtId ?? court?.id }}
          className="text-sm font-semibold text-[#059669] hover:text-[#047857]"
        >
          Quay lại
        </Link>
        <div className="mb-8 mt-4">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#10B981]">Court management</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{isEdit ? 'Chỉnh sửa sân' : 'Thêm sân mới'}</h1>
          <p className="mt-2 text-slate-600">{isEdit ? 'Cập nhật thông tin và trạng thái sân.' : 'Tạo sân mới trong một branch đang hoạt động.'}</p>
        </div>

        {branchesQuery.isError && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">Không thể tải danh sách branch. {getCourtErrorMessage(branchesQuery.error)}</div>}
        {submitError && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</div>}

        {courtTypesQuery.isError && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">Khong the tai danh sach loai san. {getCourtErrorMessage(courtTypesQuery.error)}</div>}

        <CourtForm
          values={values}
          errors={errors}
          branches={activeBranches}
          courtTypes={selectableCourtTypes}
          isCourtTypesLoading={courtTypesQuery.isPending}
          isEdit={isEdit}
          isSubmitting={mutation.isPending || branchesQuery.isPending || courtTypesQuery.isPending}
          submitLabel={isEdit ? 'Cập nhật sân' : 'Tạo sân'}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

function PageMessage({ title, description, actionLabel, onAction }: { title: string; description?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
      {description && <p className="mt-3 text-slate-600">{description}</p>}
      <div className="mt-6 flex justify-center gap-3">
        {onAction && actionLabel && <button onClick={onAction} className="rounded-xl bg-[#10B981] px-4 py-2 text-sm font-bold text-white">{actionLabel}</button>}
        <Link to="/admin/courts" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700">Về danh sách</Link>
      </div>
    </div>
  )
}
