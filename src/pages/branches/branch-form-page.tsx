import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import {
  createBranch,
  getBranchDetail,
  updateBranch,
} from '@/services/branch/branch.api'
import { useAuth } from '@/hooks/use-auth-context'
import type { Branch } from '@/types/branch'
import { BranchForm } from './branch-form'
import {
  getBranchErrorCode,
  getBranchErrorMessage,
  getBranchFieldErrors,
} from './branch-error.utils'
import {
  branchToFormValues,
  emptyBranchFormValues,
  toCreateBranchPayload,
  toUpdateBranchPayload,
  validateBranchForm,
  type BranchFormErrors,
  type BranchFormValues,
} from './branch-form.utils'
import { findLocationCity, findLocationDistrict, sampleLocations } from '@/data/sample-locations'

import { UpgradePlanModal } from '@/components/admin/UpgradePlanModal'
import { uploadImage } from '@/services/upload/image-upload.api'

type BranchFormPageProps = {
  mode: 'create' | 'edit'
}

export function BranchFormPage({ mode }: BranchFormPageProps) {
  const params = useParams()
  const branchId = Number(params.branchId)
  const isEdit = mode === 'edit'
  const hasValidId = Number.isInteger(branchId) && branchId > 0

  const detailQuery = useQuery({
    queryKey: ['branches', 'detail', branchId],
    queryFn: () => getBranchDetail(branchId),
    enabled: isEdit && hasValidId,
    retry: false,
  })

  if (!isEdit) {
    return <BranchEditor mode="create" />
  }

  if (!hasValidId) return <Navigate to="/admin/branches" replace />

  if (detailQuery.isPending) {
    return <PageMessage title="Đang tải thông tin chi nhánh..." />
  }

  if (detailQuery.isError) {
    const notFound = getBranchErrorCode(detailQuery.error) === 'branch_not_found'
    return (
      <PageMessage
        title={notFound ? 'Không tìm thấy chi nhánh' : 'Không thể tải thông tin chi nhánh'}
        description={
          notFound
            ? 'Chi nhánh này không còn tồn tại hoặc đã ngừng hoạt động.'
            : getBranchErrorMessage(detailQuery.error)
        }
        actionLabel="Thử lại"
        onAction={() => void detailQuery.refetch()}
      />
    )
  }

  return (
    <BranchEditor
      key={detailQuery.data.id}
      mode="edit"
      branch={detailQuery.data}
    />
  )
}

type BranchEditorProps = {
  mode: 'create' | 'edit'
  branch?: Branch
}

function BranchEditor({ mode, branch }: BranchEditorProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isEdit = mode === 'edit'
  const [values, setValues] = useState<BranchFormValues>(() =>
    branch ? branchToFormValues(branch) : emptyBranchFormValues,
  )
  const [errors, setErrors] = useState<BranchFormErrors>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [limitMessage, setLimitMessage] = useState<string | null>(null)

  const locationCity = findLocationCity(values.city)
  const locationDistricts = locationCity?.districts ?? []
  const locationDistrict = findLocationDistrict(values.city, values.district)
  const cityOptions = Array.from(new Set([
    ...sampleLocations.map((location) => location.city),
    ...(values.city ? [values.city] : []),
  ]))
  const districtOptions = Array.from(new Set([
    ...locationDistricts.map((district) => district.name),
    ...(values.district ? [values.district] : []),
  ]))
  const wardOptions = Array.from(new Set([
    ...(locationDistrict?.wards.map((ward) => ward.name) ?? []),
    ...(values.ward ? [values.ward] : []),
  ]))

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user || !Number.isInteger(user.id) || user.id <= 0) {
        throw new Error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.')
      }
      const bankQrImageUrl = imageFile
        ? await uploadImage(imageFile, 'branch-qr')
        : values.bankQrImageUrl
      if (isEdit && branch) {
        return updateBranch(branch.id, { ...toUpdateBranchPayload(values, user.id), bankQrImageUrl: bankQrImageUrl || null })
      }
      return createBranch({ ...toCreateBranchPayload(values, user.id), bankQrImageUrl: bankQrImageUrl || null })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['branches'] })
      navigate('/admin/branches', {
        replace: true,
        state: {
          successMessage: isEdit
            ? 'Cập nhật chi nhánh thành công.'
            : 'Tạo chi nhánh thành công.',
        },
      })
    },
    onError: (error: unknown) => {
      const errorObj = error as { response?: { data?: { code?: string; message?: string } }; message?: string }
      const errCode = errorObj?.response?.data?.code || ''
      const errServerMsg = errorObj?.response?.data?.message || errorObj?.message || ''

      if (
        errCode === 'branch_limit_exceeded' ||
        errCode === 'subscription_limit_exceeded' ||
        errServerMsg.toLowerCase().includes('limit') ||
        errServerMsg.toLowerCase().includes('gói')
      ) {
        setShowUpgradeModal(true)
        setLimitMessage(errServerMsg)
        return
      }

      setErrors((current) => ({
        ...current,
        ...getBranchFieldErrors(error),
      }))
      setSubmitError(getBranchErrorMessage(error))
    },
  })

  function handleChange(field: keyof BranchFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === 'city' ? { district: '', ward: '' } : {}),
      ...(field === 'district' ? { ward: '' } : {}),
    }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateBranchForm(values)
    setErrors(nextErrors)
    setSubmitError('')

    if (!user) {
      setSubmitError('Bạn cần đăng nhập để quản lý chi nhánh.')
      return
    }

    if (Object.keys(nextErrors).length === 0) mutation.mutate()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/admin/branches"
        className="text-sm font-semibold text-[#059669] hover:text-[#047857]"
      >
        Quay lại danh sách chi nhánh
      </Link>
      <div className="mb-8 mt-4">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#10B981]">
          Quản lý chi nhánh
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          {isEdit ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'}
        </h1>
        <p className="mt-2 text-slate-600">
          {isEdit
            ? 'Cập nhật đầy đủ thông tin của chi nhánh.'
            : 'Thêm một chi nhánh mới vào hệ thống.'}
        </p>
      </div>

      {submitError && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {submitError}
        </div>
      )}

      <BranchForm
        values={values}
        errors={errors}
        isSubmitting={mutation.isPending}
        submitLabel={isEdit ? 'Cập nhật chi nhánh' : 'Tạo chi nhánh'}
        onChange={handleChange}
        imageFile={imageFile}
        onImageFileChange={(file) => {
          setImageFile(file)
          setErrors((current) => ({ ...current, bankQrImageUrl: undefined }))
        }}
        onClearImage={() => {
          setImageFile(null)
          handleChange('bankQrImageUrl', '')
        }}
        onSubmit={handleSubmit}
        cities={cityOptions}
        districts={districtOptions}
        wards={wardOptions}
      />

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType="BRANCH"
        message={limitMessage}
      />
    </div>
  )
}

type PageMessageProps = {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

function PageMessage({ title, description, actionLabel, onAction }: PageMessageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
      {description && <p className="mt-3 text-slate-600">{description}</p>}
      <div className="mt-6 flex justify-center gap-3">
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className="rounded-xl bg-[#10B981] px-4 py-2 text-sm font-bold text-white hover:bg-[#059669] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
          >
            {actionLabel}
          </button>
        )}
        <Link
          to="/admin/branches"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700"
        >
          Về danh sách
        </Link>
      </div>
    </div>
  )
}
