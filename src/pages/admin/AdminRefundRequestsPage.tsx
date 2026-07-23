import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, HandCoins, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/common/utils/api-error'
import { confirmRefundRequest, getRefundRequests } from '@/services/refund/refund.api'
import type { RefundRequestResponse } from '@/types/booking'

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

export function AdminRefundRequestsPage() {
  const [page, setPage] = useState(0)
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['refund-requests', page],
    queryFn: () => getRefundRequests({ status: 'PENDING', page, size: 10 }),
  })

  const confirmMutation = useMutation({
    mutationFn: confirmRefundRequest,
    onSuccess: async () => {
      toast.success('Đã xác nhận hoàn tiền')
      await queryClient.invalidateQueries({ queryKey: ['refund-requests'] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Không thể xác nhận hoàn tiền'))
    },
  })

  const refunds = query.data?.content ?? []
  const totalPages = query.data?.totalPages ?? 1

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Yêu cầu hoàn tiền</h1>
          <p className="mt-1 text-sm text-slate-500">
            Các booking đã hủy sau thanh toán, cần chuyển khoản hoàn 80% thủ công.
          </p>
        </div>
        <button
          type="button"
          onClick={() => query.refetch()}
          disabled={query.isFetching}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          <RefreshCw size={16} className={query.isFetching ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <HandCoins size={18} className="text-emerald-700" />
            Danh sách chờ xử lý
          </div>
        </div>

        {query.isLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Đang tải yêu cầu hoàn tiền...</div>
        ) : query.isError ? (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {getApiErrorMessage(query.error, 'Không thể tải yêu cầu hoàn tiền')}
          </div>
        ) : refunds.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            Không có yêu cầu hoàn tiền đang chờ xử lý.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Booking</th>
                  <th className="px-5 py-3">Khách hàng</th>
                  <th className="px-5 py-3">Số tiền hoàn</th>
                  <th className="px-5 py-3">Thông tin nhận tiền</th>
                  <th className="px-5 py-3">Lý do</th>
                  <th className="px-5 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {refunds.map((refund) => (
                  <RefundRow
                    key={refund.id}
                    refund={refund}
                    confirming={confirmMutation.isPending}
                    onConfirm={() => confirmMutation.mutate(refund.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
          <span>
            Trang {page + 1}/{Math.max(1, totalPages)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-50"
            >
              Trước
            </button>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RefundRow({
  refund,
  confirming,
  onConfirm,
}: {
  refund: RefundRequestResponse
  confirming: boolean
  onConfirm: () => void
}) {
  return (
    <tr className="text-sm text-slate-700">
      <td className="px-5 py-4 align-top">
        <div className="font-mono font-semibold text-slate-900">{refund.bookingCode}</div>
        <div className="mt-1 text-xs text-slate-500">{refund.branchName}</div>
      </td>
      <td className="px-5 py-4 align-top">
        <div className="font-semibold text-slate-900">
          {refund.customerEmail || refund.guestPhone || 'Khách vãng lai'}
        </div>
        {refund.guestPhone && <div className="mt-1 text-xs text-slate-500">{refund.guestPhone}</div>}
      </td>
      <td className="px-5 py-4 align-top font-bold text-emerald-700">
        {currency.format(refund.amount)}
      </td>
      <td className="px-5 py-4 align-top">
        <div className="font-semibold text-slate-900">{refund.refundBankName}</div>
        <div className="mt-1 font-mono text-xs text-slate-600">{refund.refundBankAccountNumber}</div>
        <div className="mt-1 text-xs text-slate-500">{refund.refundBankAccountName}</div>
      </td>
      <td className="max-w-xs px-5 py-4 align-top text-slate-600">{refund.reason}</td>
      <td className="px-5 py-4 align-top">
        <button
          type="button"
          disabled={confirming}
          onClick={onConfirm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          <CheckCircle2 size={15} />
          Đã chuyển khoản
        </button>
      </td>
    </tr>
  )
}
