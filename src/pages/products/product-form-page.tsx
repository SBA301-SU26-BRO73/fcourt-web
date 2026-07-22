import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import { getBranches } from '@/services/branch/branch.api'
import { createProduct, getAdminProducts, updateProduct } from '@/services/product/product.api'
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

export function ProductFormPage({ mode }: ProductFormPageProps) {
  const params = useParams()
  const productId = Number(params.productId)
  const isEdit = mode === 'edit'
  const hasValidId = Number.isInteger(productId) && productId > 0

  // Backend has no admin get-by-id endpoint, so edit mode loads the product
  // out of the admin list query (already cached by the list page in most flows).
  const productsQuery = useQuery({
    queryKey: ['products', 'admin-list'],
    queryFn: getAdminProducts,
    enabled: isEdit && hasValidId,
    retry: false,
  })

  if (!isEdit) return <ProductEditor mode="create" />
  if (!hasValidId) return <Navigate to="/admin/products" replace />
  if (productsQuery.isPending) return <PageMessage title="Đang tải thông tin sản phẩm..." />
  if (productsQuery.isError) {
    return (
      <PageMessage
        title="Không thể tải thông tin sản phẩm"
        description={getProductErrorMessage(productsQuery.error)}
        actionLabel="Thử lại"
        onAction={() => void productsQuery.refetch()}
      />
    )
  }
  const product = productsQuery.data.find((item) => item.id === productId)
  if (!product) {
    return <PageMessage title="Không tìm thấy sản phẩm" description="Sản phẩm có thể đã bị xóa." />
  }
  return <ProductEditor key={product.id} mode="edit" product={product} />
}

function ProductEditor({ mode, product }: { mode: 'create' | 'edit'; product?: Product }) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const isEdit = mode === 'edit'
  const [values, setValues] = useState<ProductFormValues>(() =>
    product ? productToFormValues(product) : emptyProductFormValues,
  )
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [submitError, setSubmitError] = useState('')

  const branchesQuery = useQuery({
    queryKey: ['branches', 'product-form-options'],
    queryFn: () => getBranches({ page: 0, size: 100, sortField: 'name', sortDirection: 'asc' }),
  })

  const mutation = useMutation({
    mutationFn: () => (isEdit && product
      ? updateProduct(product.id, toUpdateProductPayload(values))
      : createProduct(Number(values.branchId), toCreateProductPayload(values))),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      navigate('/admin/products', {
        replace: true,
        state: { successMessage: isEdit ? 'Cập nhật sản phẩm thành công.' : 'Tạo sản phẩm thành công.' },
      })
    },
    onError: (error: unknown) => {
      setErrors((current) => ({ ...current, ...getProductFieldErrors(error) }))
      setSubmitError(getProductErrorMessage(error))
    },
  })

  function handleChange(field: keyof ProductFormValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateProductForm(values)
    setErrors(nextErrors)
    setSubmitError('')
    if (Object.keys(nextErrors).length === 0) mutation.mutate()
  }

  const activeBranches = (branchesQuery.data?.content ?? [])
    .filter((branch) => branch.status === 'ACTIVE')
    .map(({ id, name, status }) => ({ id, name, status }))
  if (product && !activeBranches.some((branch) => branch.id === product.branchId)) {
    activeBranches.push({ id: product.branchId, name: product.branchName, status: 'ACTIVE' })
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/admin/products" state={location.state} className="text-sm font-semibold text-[#059669] hover:text-[#047857]">
          Quay lại
        </Link>
        <div className="mb-8 mt-4">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#10B981]">Product management</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
          <p className="mt-2 text-slate-600">{isEdit ? 'Cập nhật tên, giá, đơn vị và trạng thái bán.' : 'Tạo sản phẩm POS mới cho một chi nhánh đang hoạt động.'}</p>
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

function PageMessage({ title, description, actionLabel, onAction }: { title: string; description?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
      {description && <p className="mt-3 text-slate-600">{description}</p>}
      <div className="mt-6 flex justify-center gap-3">
        {onAction && actionLabel && <button onClick={onAction} className="rounded-xl bg-[#10B981] px-4 py-2 text-sm font-bold text-white">{actionLabel}</button>}
        <Link to="/admin/products" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700">Về danh sách</Link>
      </div>
    </div>
  )
}
