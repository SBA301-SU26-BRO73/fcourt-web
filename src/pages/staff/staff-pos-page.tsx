import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
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
            <p className="text-center text-xs text-amber-800">
              {branch?.bankAccountName} · {branch?.bankAccountNumber} ({branch?.bankName})
            </p>
            <Button variant="primary" disabled={confirming} onClick={handleConfirmReceived}>
              {confirming ? 'Đang xác nhận…' : 'Xác nhận đã nhận tiền'}
            </Button>
          </div>
        )}

        {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex gap-2 print:hidden">
          <Button variant="ghost" onClick={() => window.print()} className="flex-1">
            In hoá đơn
          </Button>
          <Button variant="neutral" onClick={resetForNextSale} className="flex-1">
            Bán tiếp
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      {/* Product grid */}
      <div>
        <h1 className="mb-3 text-lg font-bold tracking-tight text-slate-900">Bán hàng tại quầy</h1>
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
        <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <ShoppingCart size={16} /> Giỏ hàng
        </div>

        {lines.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">Chưa có sản phẩm nào.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {lines.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate">{product.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Giảm số lượng"
                  onClick={() => changeQuantity(product.id, -1)}
                >
                  <Minus size={14} />
                </Button>
                <span className="w-6 text-center font-mono">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Tăng số lượng"
                  onClick={() => changeQuantity(product.id, 1)}
                >
                  <Plus size={14} />
                </Button>
                <span className="w-20 text-right font-mono">{formatMoney(product.price * quantity)}</span>
                <Button
                  variant="danger"
                  size="icon"
                  aria-label="Xoá sản phẩm"
                  onClick={() => removeLine(product.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 font-semibold text-slate-900">
          <span>Tổng cộng</span>
          <span className="font-mono">{formatMoney(total)}</span>
        </div>

        <Field label="Gộp vào booking">
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value === 'standalone' ? 'standalone' : Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          >
            <option value="standalone">Bill riêng (không gộp)</option>
            {activeCheckedInBookings.map((b) => (
              <option key={b.bookingId} value={b.bookingId}>
                #{b.bookingId} · {b.courtName} · {b.customerName ?? b.guestPhone ?? 'Khách'}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex gap-2 text-xs font-medium">
          <button
            type="button"
            aria-pressed={method === 'CASH'}
            onClick={() => setMethod('CASH')}
            className={`flex-1 rounded-lg border px-2 py-1.5 ${
              method === 'CASH' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-600'
            }`}
          >
            Tiền mặt
          </button>
          <button
            type="button"
            aria-pressed={method === 'TRANSFER'}
            onClick={() => setMethod('TRANSFER')}
            className={`flex-1 rounded-lg border px-2 py-1.5 ${
              method === 'TRANSFER' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-600'
            }`}
          >
            Chuyển khoản
          </button>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <Button
          variant="primary"
          disabled={lines.length === 0 || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Đang tạo hoá đơn…' : 'Tạo hoá đơn'}
        </Button>
        {lines.length > 0 && (
          <Button
            variant="link"
            icon={<X size={14} />}
            onClick={() => setCart(new Map())}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Xoá giỏ hàng
          </Button>
        )}
      </div>
    </div>
  )
}
