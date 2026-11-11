import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Package, PackagePlus, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Modal } from '@/components/ui/modal'
import { SearchInput } from '@/components/ui/search-input'
import { useAdjustStock, useAdminProducts, useSetProductActive } from '@/hooks/use-admin-products'
import { useIdempotencyKey } from '@/hooks/use-idempotency-key'
import { getBranches } from '@/services/branch/branch.api'
import type { Product } from '@/types/product'
import { getProductErrorMessage } from './product-error.utils'
import { toStockAdjustmentPayload, validateStockAdjustment } from './product-form.utils'

type LocationState = { successMessage?: string; branchId?: number } | null
type StatusFilter = 'all' | 'active' | 'inactive'

const PAGE_SIZE = 20
const LOW_STOCK = 5

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'active', label: 'Đang bán' },
  { id: 'inactive', label: 'Ngừng bán' },
]

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export function ProductListPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState
  const successMessage = state?.successMessage

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(state?.branchId ?? null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(0)
  const [adjusting, setAdjusting] = useState<Product | null>(null)

  const branchesQuery = useQuery({
    queryKey: ['branches', 'product-list-options'],
    queryFn: () => getBranches({ page: 0, size: 100, sortField: 'name', sortDirection: 'asc' }),
  })
  const branches = branchesQuery.data?.content ?? []
  const branchId = selectedBranchId ?? branches[0]?.id ?? null
  const branchNames = Object.fromEntries(branches.map((branch) => [branch.id, branch.name]))

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query)
      setPage(0)
    }, 300)
    return () => window.clearTimeout(timeoutId)
  }, [query])

  const productsQuery = useAdminProducts(
    branchId === null
      ? null
      : {
          branchId,
          page,
          size: PAGE_SIZE,
          query: debouncedQuery,
          ...(statusFilter === 'all' ? {} : { active: statusFilter === 'active' }),
        },
  )
  const activeMutation = useSetProductActive()

  useEffect(() => {
    if (!successMessage) return
    const timeoutId = window.setTimeout(
      () => navigate(location.pathname, { replace: true, state: { branchId: state?.branchId } }),
      5000,
    )
    return () => window.clearTimeout(timeoutId)
  }, [location.pathname, navigate, state?.branchId, successMessage])

  function handleStopSelling(product: Product) {
    const confirmed = window.confirm(`Ngừng bán "${product.name}"? Sản phẩm sẽ hết hiển thị ở quầy Staff.`)
    if (confirmed) activeMutation.mutate({ product, active: false })
  }

  const data = productsQuery.data
  const products = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const listState = { branchId: branchId ?? undefined }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý sản phẩm POS</h1>
          <p className="mt-1 text-sm text-slate-500">Sản phẩm bán tại quầy (nước uống, thuê vợt...) cho các chi nhánh của bạn.</p>
        </div>
        <div className="flex items-center gap-2">
          {branches.length > 0 && (
            <select
              aria-label="Chi nhánh"
              value={branchId ?? ''}
              onChange={(event) => {
                setSelectedBranchId(Number(event.target.value))
                setPage(0)
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          )}
          <Link
            to="/admin/products/new"
            state={listState}
            style={{ backgroundColor: '#006d38' }}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="size-5 text-white stroke-[3]" aria-hidden="true" />
            <span className="text-white">Thêm sản phẩm</span>
          </Link>
        </div>
      </div>

      {successMessage && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{successMessage}</div>}
      {activeMutation.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{getProductErrorMessage(activeMutation.error)}</div>}

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Tìm theo tên sản phẩm…" />
        <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id)
                setPage(0)
              }}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {branchesQuery.isPending || (branchId !== null && productsQuery.isPending) ? (
        <StatePanel title="Đang tải danh sách sản phẩm..." />
      ) : branchesQuery.isError ? (
        <StatePanel title="Không thể tải danh sách chi nhánh" description={getProductErrorMessage(branchesQuery.error)} actionLabel="Thử lại" onAction={() => void branchesQuery.refetch()} />
      ) : branchId === null ? (
        <StatePanel title="Bạn chưa có chi nhánh nào" description="Tạo chi nhánh trước khi thêm sản phẩm POS." />
      ) : productsQuery.isError ? (
        <StatePanel title="Không thể tải danh sách sản phẩm" description={getProductErrorMessage(productsQuery.error)} actionLabel="Thử lại" onAction={() => void productsQuery.refetch()} />
      ) : products.length === 0 ? (
        <StatePanel title="Chưa có sản phẩm nào" description="Tạo sản phẩm đầu tiên để Staff có thể bán tại quầy." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Sản phẩm</th>
                <th className="px-5 py-3">Nhóm</th>
                <th className="px-5 py-3">Đơn vị</th>
                <th className="px-5 py-3">Giá bán</th>
                <th className="px-5 py-3">Tồn kho</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-900">
                    <span className="inline-flex items-center gap-2">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="size-8 rounded-lg object-cover" />
                      ) : (
                        <Package className="size-4 text-emerald-600" aria-hidden="true" />
                      )}
                      {product.name}
                    </span>
                    <span className="block text-xs font-normal text-slate-400">{branchNames[product.branchId]}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{product.category}</td>
                  <td className="px-5 py-3 text-slate-600">{product.unit || '—'}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{formatPrice(product.price)}</td>
                  <td className="px-5 py-3">
                    <span className={`font-semibold ${product.stockQuantity <= LOW_STOCK ? 'text-red-600' : 'text-slate-800'}`}>
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {product.active ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setAdjusting(product)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100"><PackagePlus className="size-4" aria-hidden="true" />Tồn kho</button>
                      <Link to={`/admin/products/${product.id}/edit`} state={{ product }} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-bold text-[#059669] hover:bg-emerald-50"><Pencil className="size-4" aria-hidden="true" />Sửa</Link>
                      {product.active ? (
                        <button type="button" disabled={activeMutation.isPending} onClick={() => handleStopSelling(product)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 className="size-4" aria-hidden="true" />Ngừng bán</button>
                      ) : (
                        <button type="button" disabled={activeMutation.isPending} onClick={() => activeMutation.mutate({ product, active: true })} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-bold text-[#059669] hover:bg-emerald-50 disabled:opacity-50"><RotateCcw className="size-4" aria-hidden="true" />Bán lại</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
              <span>{data?.totalElements} sản phẩm</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded-md border border-slate-200 p-1 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft size={13} /></button>
                <span className="font-mono">{page + 1} / {totalPages}</span>
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="rounded-md border border-slate-200 p-1 hover:bg-slate-50 disabled:opacity-40"><ChevronRight size={13} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {adjusting && <StockAdjustmentModal product={adjusting} onClose={() => setAdjusting(null)} />}
    </div>
  )
}

function StockAdjustmentModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [values, setValues] = useState({ delta: '', reason: '' })
  const [error, setError] = useState('')
  const mutation = useAdjustStock()
  const keyFor = useIdempotencyKey()

  function submit() {
    const message = validateStockAdjustment(values, product.stockQuantity)
    setError(message ?? '')
    if (message) return
    const payload = toStockAdjustmentPayload(values)
    mutation.mutate(
      { id: product.id, payload, key: keyFor({ id: product.id, payload }) },
      { onSuccess: onClose, onError: (err: unknown) => setError(getProductErrorMessage(err)) },
    )
  }

  const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100'

  return (
    <Modal
      title="Điều chỉnh tồn kho"
      subtitle={`${product.name} · hiện còn ${product.stockQuantity}`}
      onClose={onClose}
      width={460}
      footer={
        <>
          <Button onClick={onClose} disabled={mutation.isPending}>Huỷ</Button>
          <Button variant="primary" disabled={mutation.isPending} onClick={submit}>
            {mutation.isPending ? 'Đang lưu…' : 'Lưu điều chỉnh'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}
        <Field label="Số lượng thay đổi" required hint="Số dương để nhập thêm, số âm để trừ (hỏng, thất thoát).">
          <input
            type="number"
            step="1"
            value={values.delta}
            onChange={(event) => { setValues((v) => ({ ...v, delta: event.target.value })); setError('') }}
            className={inputClass}
          />
        </Field>
        <Field label="Lý do" required>
          <input
            value={values.reason}
            maxLength={500}
            onChange={(event) => { setValues((v) => ({ ...v, reason: event.target.value })); setError('') }}
            className={inputClass}
          />
        </Field>
      </div>
    </Modal>
  )
}

function StatePanel({ title, description, actionLabel, onAction }: { title: string; description?: string; actionLabel?: string; onAction?: () => void }) {
  return <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white px-6 py-16 text-center shadow-sm"><h2 className="text-lg font-bold">{title}</h2>{description && <p className="mx-auto mt-2 max-w-lg text-sm text-[#6B7280]">{description}</p>}{actionLabel && onAction && <button type="button" onClick={onAction} className="mt-5 rounded-xl bg-[#10B981] px-4 py-2 text-sm font-bold text-white hover:bg-[#059669]">{actionLabel}</button>}</div>
}
