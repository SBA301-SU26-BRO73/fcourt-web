import type { OrderResponse } from '@/types/pos'

function formatMoney(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ'
}

interface ReceiptPrintProps {
  order: OrderResponse
  branchName?: string
}

/** Printable POS receipt — `window.print()` picks this up via @media print. */
export function ReceiptPrint({ order, branchName }: ReceiptPrintProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 print:border-none print:p-0">
      <div className="mb-4 text-center">
        <div className="text-base font-bold text-slate-900">{branchName ?? 'FCourt'}</div>
        <div className="text-xs text-slate-400">Hoá đơn bán lẻ #{order.id}</div>
        <div className="text-xs text-slate-400">
          {new Date(order.createdAt).toLocaleString('vi-VN')}
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
            <th className="pb-1">Sản phẩm</th>
            <th className="pb-1 text-right">SL</th>
            <th className="pb-1 text-right">Đơn giá</th>
            <th className="pb-1 text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.productId}>
              <td className="py-1">{item.productName}</td>
              <td className="py-1 text-right">{item.quantity}</td>
              <td className="py-1 text-right font-mono">{formatMoney(item.priceAtOrder)}</td>
              <td className="py-1 text-right font-mono">{formatMoney(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
        <span>Tổng cộng</span>
        <span className="font-mono">{formatMoney(order.totalAmount)}</span>
      </div>

      <div className="mt-2 text-center text-xs text-slate-500">
        {order.bookingId ? `Gộp vào booking #${order.bookingId}` : 'Bill riêng'} ·{' '}
        {order.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'} ·{' '}
        {order.status === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
      </div>
    </div>
  )
}
