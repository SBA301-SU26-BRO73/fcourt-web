import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import { useSaveProduct } from '@/hooks/use-admin-products'
import { useIdempotencyKey } from '@/hooks/use-idempotency-key'
import { getBranches } from '@/services/branch/branch.api'
import type { Product } from '@/types/product'
import { ProductForm } from './product-form'
import { getProductErrorMessage, getProductFieldErrors } from './product-error.utils'
import {
  emptyProductFormValues,
  productToFormValues,
  toCreateProductPayload,
  toUpdateProductPayload,
  validateProductForm,
  type ProductFormErrors,
  type ProductFormValues,
} from './product-form.utils'

type ProductFormPageProps = { mode: 'create' | 'edit' }
type ProductLocationState = { product?: Product; branchId?: number } | null

export function ProductFormPage({ mode }: ProductFormPageProps) {
  const params = useParams()
  const location = useLocation()
  const productId = Number(params.productId)
  const state = location.state as ProductLocationState

  if (mode === 'create') return <ProductEditor mode="create" defaultBranchId={state?.branchId} />

  // The backend has no get-by-id: the list hands the product over through the router state.
  const product = state?.product
  if (!product || product.id !== productId) return <Navigate to="/admin/products" replace />
  return <ProductEditor key={product.id} mode="edit" product={product} />
}

function ProductEditor({
  mode,
  product,
  defaultBranchId,
}: {
  mode: 'create' | 'edit'
  product?: Product
  defaultBranchId?: number
}) {
  const navigate = useNavigate()
  const isEdit = mode === 'edit'
  const [values, setValues] = useState<ProductFormValues>(() =>
    product
      ? productToFormValues(product)
      : { ...emptyProductFormValues, branchId: defaultBranchId ? String(defaultBranchId) : '' },
  )
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const keyFor = useIdempotencyKey()

  const branchesQuery = useQuery({
    queryKey: ['branches', 'product-form-options'],
    queryFn: () => getBranches({ page: 0, size: 100, sortField: 'name', sortDirection: 'asc' }),
  })

  const mutation = useSaveProduct()

  function submit() {
    const payload = isEdit ? toUpdateProductPayload(values) : toCreateProductPayload(values)
    mutation.mutate(
      { id: product?.id, payload, key: keyFor({ id: product?.id, payload }) },
      {
        onSuccess: (saved) => {
          navigate('/admin/products', {
            replace: true,
            state: {
              branchId: saved.branchId,
              successMessage: isEdit ? 'Cập nhật sản phẩm thành công.' : 'Tạo sản phẩm thành công.',
            },
          })
        },
        onError: (error: unknown) => {
          setErrors((current) => ({ ...current, ...getProductFieldErrors(error) }))
          setSubmitError(getProductErrorMessage(error))
        },
      },
    )
  }

  function handleChange(field: keyof ProductFormValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateProductForm(values, isEdit)
    setErrors(nextErrors)
    setSubmitError('')
    if (Object.keys(nextErrors).length === 0) submit()
  }

  const activeBranches = (branchesQuery.data?.content ?? [])
    .filter((branch) => branch.status === 'ACTIVE')
    .map(({ id, name, status }) => ({ id, name, status }))
  if (product && !activeBranches.some((branch) => branch.id === product.branchId)) {
    const known = branchesQuery.data?.content.find((branch) => branch.id === product.branchId)
    activeBranches.push({ id: product.branchId, name: known?.name ?? `Chi nhánh #${product.branchId}`, status: 'ACTIVE' })
  }

  const backState = { branchId: product?.branchId ?? (values.branchId ? Number(values.branchId) : undefined) }

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/admin/products" state={backState} className="text-sm font-semibold text-[#059669] hover:text-[#047857]">
          Quay lại
        </Link>
        <div className="mb-8 mt-4">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#10B981]">Product management</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
          <p className="mt-2 text-slate-600">{isEdit ? 'Cập nhật tên, giá, nhóm, ảnh và trạng thái bán. Tồn kho điều chỉnh ở danh sách.' : 'Tạo sản phẩm POS mới cho một chi nhánh đang hoạt động.'}</p>
        </div>

        {branchesQuery.isError && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">Không thể tải danh sách chi nhánh. {getProductErrorMessage(branchesQuery.error)}</div>}
        {submitError && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</div>}

        <ProductForm
          values={values}
          errors={errors}
          branches={activeBranches}
          isEdit={isEdit}
          isSubmitting={mutation.isPending || branchesQuery.isPending}
          submitLabel={isEdit ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
