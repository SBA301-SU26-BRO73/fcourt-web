import { Package } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { getAdminProducts } from '@/services/product/product.api'
import { getProductErrorMessage } from '@/pages/products/product-error.utils'

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export function SuperAdminProductsPage() {
  const productsQuery = useQuery({
    queryKey: ['products', 'super-admin-list'],
    queryFn: getAdminProducts,
  })

  const products = productsQuery.data ?? []

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sản phẩm POS</h1>
        <p className="mt-1 text-sm text-slate-500">
          Toàn bộ sản phẩm bán tại quầy trên mọi chi nhánh, không phân biệt chủ sân.
        </p>
      </div>

      {productsQuery.isPending ? (
        <StatePanel title="Đang tải danh sách sản phẩm..." />
      ) : productsQuery.isError ? (
        <StatePanel
          title="Không thể tải danh sách sản phẩm"
          description={getProductErrorMessage(productsQuery.error)}
          actionLabel="Thử lại"
          onAction={() => void productsQuery.refetch()}
        />
      ) : products.length === 0 ? (
        <StatePanel title="Chưa có sản phẩm nào" />
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-slate-900">
                    <span className="inline-flex items-center gap-2">
                      <Package className="size-4 text-emerald-600" aria-hidden="true" />
                      {product.name}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">#{product.branchId}</td>
                  <td className="px-5 py-3 text-slate-600">{product.unit || '—'}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{formatPrice(product.price)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        product.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {product.active ? 'Đang bán' : 'Ngừng bán'}
                    </span>
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

function StatePanel({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white px-6 py-16 text-center shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-lg text-sm text-[#6B7280]">{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-xl bg-[#10B981] px-4 py-2 text-sm font-bold text-white hover:bg-[#059669]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
