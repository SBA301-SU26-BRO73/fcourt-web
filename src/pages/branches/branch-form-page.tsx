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
    return <PageMessage title="Loading branch..." />
  }

  if (detailQuery.isError) {
    const notFound = getBranchErrorCode(detailQuery.error) === 'branch_not_found'
    return (
      <PageMessage
        title={notFound ? 'Branch not found' : 'Unable to load branch'}
        description={
          notFound
            ? 'This branch no longer exists or is inactive.'
            : getBranchErrorMessage(detailQuery.error)
        }
        actionLabel="Try again"
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
  const [submitError, setSubmitError] = useState('')

  const mutation = useMutation({
    mutationFn: () => {
      if (!user || !Number.isInteger(user.id) || user.id <= 0) {
        throw new Error('Your login session is invalid. Please sign in again.')
      }
      if (isEdit && branch) {
        return updateBranch(branch.id, toUpdateBranchPayload(values, user.id))
      }
      return createBranch(toCreateBranchPayload(values, user.id))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['branches'] })
      navigate('/admin/branches', {
        replace: true,
        state: {
          successMessage: isEdit
            ? 'Branch updated successfully.'
            : 'Branch created successfully.',
        },
      })
    },
    onError: (error) => {
      setErrors((current) => ({
        ...current,
        ...getBranchFieldErrors(error),
      }))
      setSubmitError(getBranchErrorMessage(error))
    },
  })

  function handleChange(field: keyof BranchFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateBranchForm(values)
    setErrors(nextErrors)
    setSubmitError('')

    if (!user) {
      setSubmitError('You must be signed in to manage branches.')
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
        Back to branches
      </Link>
      <div className="mb-8 mt-4">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#10B981]">
          Branch management
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          {isEdit ? 'Edit branch' : 'Create branch'}
        </h1>
        <p className="mt-2 text-slate-600">
          {isEdit
            ? 'Update the complete branch record. The backend uses PUT, so all required fields are submitted.'
            : 'Add a new active branch to the system.'}
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
        submitLabel={isEdit ? 'Update branch' : 'Create branch'}
        onChange={handleChange}
        onSubmit={handleSubmit}
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
          Back to list
        </Link>
      </div>
    </div>
  )
}
