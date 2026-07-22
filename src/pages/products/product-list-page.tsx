import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MapPin, Package, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { deleteProduct, getAdminProducts } from '@/services/product/product.api'
import type { Product } from '@/types/product'
import { getProductErrorMessage } from './product-error.utils'

type LocationState = { successMessage?: string } | null

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export function ProductListPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const successMessage = (location.state as LocationState)?.successMessage

  const productsQuery = useQuery({
    queryKey: ['products', 'admin-list'],
    queryFn: getAdminProducts,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      navigate(location.pathname, { replace: true, state: { successMessage: 'Ngừng bán sản phẩm thành công.' } })
    },
  })

  useEffect(() => {
    if (!successMessage) return
    const timeoutId = window.setTimeout(() => navigate(location.pathname, { replace: true, state: null }), 5000)
    return () => window.clearTimeout(timeoutId)
  }, [location.pathname, navigate, successMessage])

  function handleDelete(product: Product) {
    const confirmed = window.confirm(`Ngừng bán "${product.name}"? Sản phẩm sẽ hết hiển thị ở quầy Staff.`)
    if (confirmed) deleteMutation.mutate(product.id)
  }

  const products = productsQuery.data ?? []

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý sản phẩm POS</h1>
          <p className="mt-1 text-sm text-slate-500">Sản phẩm bán tại quầy (nước uống, thuê vợt...) cho các chi nhánh của bạn.</p>
        </div>
        <div>
          <Link
            to="/admin/products/new"
            style={{ backgroundColor: '#006d38' }}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="size-5 text-white stroke-[3]" aria-hidden="true" />
            <span className="text-white">Thêm sản phẩm</span>
          </Link>
        </div>
      </div>

      {successMessage && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{successMessage}</div>}
      {deleteMutation.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{getProductErrorMessage(deleteMutation.error)}</div>}

      {productsQuery.isPending ? (
        <StatePanel title="Đang tải danh sách sản phẩm..." />
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
                <th className="px-5 py-3">Chi nhánh</th>
                <th className="px-5 py-3">Đơn vị</th>
                <th className="px-5 py-3">Giá bán</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-900">
                    <span className="inline-flex items-center gap-2"><Package className="size-4 text-emerald-600" aria-hidden="true" />{product.name}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5 text-slate-400" aria-hidden="true" />{product.branchName}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{product.unit || '—'}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{formatPrice(product.price)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {product.active ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/products/${product.id}/edit`} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-bold text-[#059669] hover:bg-emerald-50"><Pencil className="size-4" aria-hidden="true" />Sửa</Link>
                      {product.active && (
                        <button type="button" disabled={deleteMutation.isPending} onClick={() => handleDelete(product)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 className="size-4" aria-hidden="true" />Ngừng bán</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatePanel({ title, description, actionLabel, onAction }: { title: string; description?: string; actionLabel?: string; onAction?: () => void }) {
  return <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white px-6 py-16 text-center shadow-sm"><h2 className="text-lg font-bold">{title}</h2>{description && <p className="mx-auto mt-2 max-w-lg text-sm text-[#6B7280]">{description}</p>}{actionLabel && onAction && <button type="button" onClick={onAction} className="mt-5 rounded-xl bg-[#10B981] px-4 py-2 text-sm font-bold text-white hover:bg-[#059669]">{actionLabel}</button>}</div>
}
