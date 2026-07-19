import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'

import { useBranchGrid } from '@/hooks/staff/use-branch-grid'
import { useTodaySchedule } from '@/hooks/staff/use-today-schedule'
import { getPosProducts, createPosOrder, confirmPosOrder } from '@/services/staff/staff.api'
import { getApiErrorMessage } from '@/common/utils/api-error'
import { ReceiptPrint } from '@/pages/staff/components/receipt-print'
import type { PosProduct, PaymentMethod, OrderResponse } from '@/types/pos'

interface CartLine {
  product: PosProduct
  quantity: number
}

function formatMoney(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ'
}

export function StaffPosPage() {
  const queryClient = useQueryClient()
  const { branch } = useBranchGrid()
  const scheduleQuery = useTodaySchedule()

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['pos-products'],
    queryFn: getPosProducts,
  })

  const [cart, setCart] = useState<Map<number, CartLine>>(new Map())
  const [target, setTarget] = useState<'standalone' | number>('standalone')
  const [method, setMethod] = useState<PaymentMethod>('CASH')
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const activeCheckedInBookings = useMemo(
    () => (scheduleQuery.data ?? []).filter((b) => b.status === 'CHECKED_IN'),
    [scheduleQuery.data],
  )

  const lines = Array.from(cart.values())
  const total = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0)

  function addToCart(product: PosProduct) {
    setCart((prev) => {
      const next = new Map(prev)
      const existing = next.get(product.id)
      next.set(product.id, { product, quantity: (existing?.quantity ?? 0) + 1 })
      return next
    })
  }

  function changeQuantity(productId: number, delta: number) {
    setCart((prev) => {
      const next = new Map(prev)
      const existing = next.get(productId)
      if (!existing) return prev
      const quantity = existing.quantity + delta
      if (quantity <= 0) {
        next.delete(productId)
      } else {
        next.set(productId, { ...existing, quantity })
      }
      return next
    })
  }

  function removeLine(productId: number) {
    setCart((prev) => {
      const next = new Map(prev)
      next.delete(productId)
      return next
    })
  }

  function resetForNextSale() {
    setCart(new Map())
    setOrder(null)
    setError(null)
    setTarget('standalone')
    setMethod('CASH')
  }

  async function handleSubmit() {
    if (lines.length === 0) return
    setError(null)
    setSubmitting(true)
    try {
      const result = await createPosOrder({
        bookingId: target === 'standalone' ? null : target,
        paymentMethod: method,
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      })
      setOrder(result)
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tạo hoá đơn'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirmReceived() {
    if (!order) return
    setConfirming(true)
    try {
      const updated = await confirmPosOrder(order.id)
      setOrder(updated)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể xác nhận thanh toán'))
    } finally {
      setConfirming(false)
    }
  }

  if (order) {
    return (
      <div className="mx-auto max-w-md">
        <ReceiptPrint order={order} branchName={branch?.name} />

        {order.status === 'PENDING' && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            {branch?.bankQrImageUrl && (
              <img src={branch.bankQrImageUrl} alt="QR chuyển khoản" className="mx-auto h-48 w-48 rounded-lg" />
            )}
            <p className="text-center text-xs text-amber-800">
              {branch?.bankAccountName} · {branch?.bankAccountNumber} ({branch?.bankName})
            </p>
            <button
              type="button"
              disabled={confirming}
              onClick={handleConfirmReceived}
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {confirming ? 'Đang xác nhận…' : 'Xác nhận đã nhận tiền'}
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            In hoá đơn
          </button>
          <button
            type="button"
            onClick={resetForNextSale}
            className="flex-1 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
          >
            Bán tiếp
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      {/* Product grid */}
      <div>
        <h1 className="mb-3 text-lg font-bold text-slate-900">Bán hàng tại quầy</h1>
        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
            Đang tải sản phẩm…
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700">
            Không thể tải danh mục sản phẩm.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(products ?? []).map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addToCart(product)}
                className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-green-400 hover:bg-green-50"
              >
                <span className="text-sm font-semibold text-slate-900">{product.name}</span>
                <span className="text-xs text-slate-500">{product.unit}</span>
                <span className="mt-2 font-mono text-sm font-bold text-green-700">
                  {formatMoney(product.price)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cart */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <ShoppingCart size={18} /> Giỏ hàng
        </div>

        {lines.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">Chưa có sản phẩm nào.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {lines.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate">{product.name}</span>
                <button
                  type="button"
                  onClick={() => changeQuantity(product.id, -1)}
                  className="rounded-md border border-slate-200 p-1 hover:bg-slate-50"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center font-mono">{quantity}</span>
                <button
                  type="button"
                  onClick={() => changeQuantity(product.id, 1)}
                  className="rounded-md border border-slate-200 p-1 hover:bg-slate-50"
                >
                  <Plus size={12} />
                </button>
                <span className="w-20 text-right font-mono">{formatMoney(product.price * quantity)}</span>
                <button type="button" onClick={() => removeLine(product.id)} className="text-slate-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 font-semibold text-slate-900">
          <span>Tổng cộng</span>
          <span className="font-mono">{formatMoney(total)}</span>
        </div>

        <label className="text-xs font-medium text-slate-600">
          Gộp vào booking
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value === 'standalone' ? 'standalone' : Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          >
            <option value="standalone">Bill riêng (không gộp)</option>
            {activeCheckedInBookings.map((b) => (
              <option key={b.bookingId} value={b.bookingId}>
                #{b.bookingId} · {b.courtName} · {b.customerName ?? b.guestPhone ?? 'Khách'}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMethod('CASH')}
            className={`flex-1 rounded-lg border px-2 py-1.5 ${
              method === 'CASH' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-600'
            }`}
          >
            Tiền mặt
          </button>
          <button
            type="button"
            onClick={() => setMethod('TRANSFER')}
            className={`flex-1 rounded-lg border px-2 py-1.5 ${
              method === 'TRANSFER' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-600'
            }`}
          >
            Chuyển khoản
          </button>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="button"
          disabled={lines.length === 0 || submitting}
          onClick={handleSubmit}
          className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          {submitting ? 'Đang tạo hoá đơn…' : 'Tạo hoá đơn'}
        </button>
        {lines.length > 0 && (
          <button
            type="button"
            onClick={() => setCart(new Map())}
            className="flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-slate-600"
          >
            <X size={12} /> Xoá giỏ hàng
          </button>
        )}
      </div>
    </div>
  )
}
