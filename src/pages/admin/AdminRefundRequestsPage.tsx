import { useState } from 'react'
import { CheckCircle2, HandCoins, RefreshCw, ThumbsUp, Upload, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/common/utils/api-error'
import { BranchSelect } from '@/components/admin/BranchSelect'
import { useBranchChoice } from '@/hooks/use-branch-choice'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import {
  useApproveRefund,
  useCompleteRefund,
  usePendingRefunds,
  useRejectRefund,
} from '@/hooks/use-admin-bookings'
import type { AdminRefund } from '@/types/admin-booking'

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
})

const PAGE_SIZE = 10

export function AdminRefundRequestsPage() {
  const { branches, branchId, setBranchId } = useBranchChoice()
  const [page, setPage] = useState(0)
  const [proofFiles, setProofFiles] = useState<Record<number, File | undefined>>({})
  const [rejecting, setRejecting] = useState<AdminRefund | null>(null)

  const query = usePendingRefunds(branchId, page, PAGE_SIZE)
  const approveMutation = useApproveRefund()
  const rejectMutation = useRejectRefund()
  const completeMutation = useCompleteRefund()
  const busy = approveMutation.isPending || rejectMutation.isPending || completeMutation.isPending

  const refunds = query.data ?? []
  const hasNext = refunds.length === PAGE_SIZE

  const handleApprove = (refund: AdminRefund) => {
    if (refund.bankInfoMissing) return
    approveMutation.mutate(refund.id, {
      onSuccess: () => toast.success('Đã duyệt yêu cầu hoàn tiền, hãy chuyển khoản và tải chứng từ'),
      onError: (error) => toast.error(getApiErrorMessage(error, 'Không thể duyệt yêu cầu hoàn tiền')),
    })
  }

  const handleComplete = (refund: AdminRefund) => {
    if (refund.bankInfoMissing) return
    const proofImage = proofFiles[refund.id]
    if (!proofImage) {
      toast.error('Vui lòng tải ảnh chứng từ hoàn tiền trước khi xác nhận')
      return
    }
    completeMutation.mutate(
      { refundId: refund.id, proofImage },
      {
        onSuccess: () => {
          toast.success('Đã xác nhận hoàn tiền')
          setProofFiles((current) => ({ ...current, [refund.id]: undefined }))
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'Không thể xác nhận hoàn tiền')),
      },
    )
  }

  const handleReject = (reason: string) => {
    if (!rejecting) return
    rejectMutation.mutate(
      { refundId: rejecting.id, reason },
      {
        onSuccess: () => {
          toast.success('Đã từ chối yêu cầu hoàn tiền')
          setRejecting(null)
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'Không thể từ chối yêu cầu hoàn tiền')),
      },
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Yêu cầu hoàn tiền</h1>
          <p className="mt-1 text-sm text-slate-500">
            Duyệt yêu cầu, chuyển khoản hoàn tiền thủ công rồi tải ảnh chứng từ để hoàn tất.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BranchSelect
            branches={branches}
            value={branchId}
            onChange={(id) => {
              setBranchId(id)
              setPage(0)
            }}
          />
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
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <HandCoins size={18} className="text-emerald-700" />
            Danh sách yêu cầu hoàn tiền đang chờ xử lý
          </div>
        </div>

        {query.isLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Đang tải yêu cầu hoàn tiền...</div>
        ) : query.isError ? (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {getApiErrorMessage(query.error, 'Không thể tải yêu cầu hoàn tiền')}
          </div>
        ) : refunds.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Không có yêu cầu hoàn tiền đang chờ xử lý.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Booking</th>
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
                    busy={busy}
                    proofFile={proofFiles[refund.id]}
                    onProofFileChange={(file) => setProofFiles((current) => ({ ...current, [refund.id]: file }))}
                    onApprove={() => handleApprove(refund)}
                    onComplete={() => handleComplete(refund)}
                    onReject={() => setRejecting(refund)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
          <span>Trang {page + 1}</span>
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
              disabled={!hasNext}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {rejecting && (
        <ConfirmModal
          open
          action="reject_refund"
          bookingCode={`BK-${rejecting.bookingId}`}
          loading={rejectMutation.isPending}
          onConfirm={handleReject}
          onCancel={() => !rejectMutation.isPending && setRejecting(null)}
        />
      )}
    </div>
  )
}

function RefundRow({
  refund,
  busy,
  proofFile,
  onProofFileChange,
  onApprove,
  onComplete,
  onReject,
}: {
  refund: AdminRefund
  busy: boolean
  proofFile?: File
  onProofFileChange: (file?: File) => void
  onApprove: () => void
  onComplete: () => void
  onReject: () => void
}) {
  const approved = refund.status === 'APPROVED'

  return (
    <tr className="text-sm text-slate-700">
      <td className="px-5 py-4 align-top">
        <div className="font-mono font-semibold text-slate-900">BK-{refund.bookingId}</div>
        <div className="mt-1 text-xs text-slate-500">{new Date(refund.createdAt).toLocaleString('vi-VN')}</div>
        <div
          className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {approved ? 'Đã duyệt, chờ chuyển khoản' : 'Chờ duyệt'}
        </div>
      </td>
      <td className="px-5 py-4 align-top font-bold text-emerald-700">{currency.format(refund.amount)}</td>
      <td className="px-5 py-4 align-top">
        {refund.bankInfoMissing && (
          <div className="mb-2 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
            Chưa có thông tin ngân hàng
          </div>
        )}
        {refund.customerPhone && <div className="mb-2 text-xs text-slate-600">SĐT khách: {refund.customerPhone}</div>}
        <div className="font-semibold text-slate-900">{refund.bankName}</div>
        <div className="mt-1 font-mono text-xs text-slate-600">{refund.bankAccountNumber}</div>
        <div className="mt-1 text-xs text-slate-500">{refund.bankAccountName}</div>
      </td>
      <td className="max-w-xs px-5 py-4 align-top text-slate-600">{refund.reason}</td>
      <td className="px-5 py-4 align-top">
        <div className="space-y-2">
          {!approved && (
            <button
              type="button"
              disabled={busy || refund.bankInfoMissing}
              onClick={onApprove}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ThumbsUp size={15} />
              Duyệt yêu cầu
            </button>
          )}
          {approved && (
            <>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-emerald-300 hover:bg-emerald-50">
                <Upload size={14} />
                {proofFile ? proofFile.name : 'Tải ảnh chuyển khoản'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => onProofFileChange(event.target.files?.[0])}
                />
              </label>
              <button
                type="button"
                disabled={busy || !proofFile || refund.bankInfoMissing}
                onClick={onComplete}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={15} />
                Đã chuyển khoản
              </button>
            </>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={onReject}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <XCircle size={15} />
            Từ chối
          </button>
        </div>
      </td>
    </tr>
  )
}
