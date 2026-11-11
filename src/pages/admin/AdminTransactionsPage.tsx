import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, InboxIcon, RefreshCw, Search } from 'lucide-react'

import { getApiErrorMessage } from '@/common/utils/api-error'
import { BranchSelect } from '@/components/admin/BranchSelect'
import { ViewerButton } from '@/components/ui/image-viewer'
import { useBranchChoice } from '@/hooks/use-branch-choice'
import { useLedger } from '@/hooks/use-admin-bookings'
import type { LedgerEntry, LedgerStatus, LedgerTransactionType } from '@/types/payment'

const PAGE_SIZE = 20

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

const TYPE_LABELS: Record<LedgerTransactionType, string> = {
  ALL: 'Tất cả loại',
  BOOKING_PAYMENT: 'Thanh toán booking',
  REFUND: 'Hoàn tiền',
  WALK_IN_CASH: 'Tiền mặt tại quầy',
}

const STATUS_LABELS: Record<LedgerStatus, string> = {
  ALL: 'Tất cả trạng thái',
  SUCCESS: 'Thành công',
  PENDING: 'Chờ duyệt',
  REJECTED: 'Bị từ chối',
}

const STATUS_CLASSES: Record<LedgerEntry['status'], string> = {
  SUCCESS: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  REJECTED: 'bg-red-50 text-red-600 border border-red-200',
}

const METHOD_LABELS: Record<string, string> = {
  VIETQR: 'Chuyển khoản VietQR',
  REFUND_TRANSFER: 'Chuyển khoản hoàn tiền',
  CASH: 'Tiền mặt',
}

const selectClass =
  'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'

export function AdminTransactionsPage() {
  const { branches, branchId, setBranchId } = useBranchChoice()
  const [type, setType] = useState<LedgerTransactionType>('ALL')
  const [status, setStatus] = useState<LedgerStatus>('ALL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const invalidRange = Boolean(fromDate && toDate && fromDate > toDate)
  const query = useLedger(
    branchId === undefined || invalidRange
      ? null
      : {
          branchId,
          transactionType: type,
          status,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          search: debouncedSearch,
          page,
          size: PAGE_SIZE,
        },
  )

  const data = query.data
  const entries = data?.content ?? []
  const summary = data?.summary
  const totalPages = Math.max(1, data?.totalPages ?? 1)

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setPage(0)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sổ giao dịch</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tiền thu từ đặt sân, tiền hoàn cho khách và tiền mặt tại quầy của chi nhánh.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BranchSelect branches={branches} value={branchId} onChange={resetPage(setBranchId)} />
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Đã thu" value={summary?.received} tone="text-emerald-700" />
        <SummaryCard label="Đã hoàn" value={summary?.refunded} tone="text-red-600" />
        <SummaryCard label="Doanh thu ròng" value={summary?.netRevenue} tone="text-slate-900" />
        <SummaryCard label="Đang chờ duyệt" value={summary?.pending} tone="text-amber-600" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-6 py-4 lg:flex-row lg:flex-wrap lg:items-center">
          <select
            aria-label="Loại giao dịch"
            value={type}
            onChange={(event) => resetPage(setType)(event.target.value as LedgerTransactionType)}
            className={selectClass}
          >
            {(Object.keys(TYPE_LABELS) as LedgerTransactionType[]).map((key) => (
              <option key={key} value={key}>
                {TYPE_LABELS[key]}
              </option>
            ))}
          </select>
          <select
            aria-label="Trạng thái giao dịch"
            value={status}
            onChange={(event) => resetPage(setStatus)(event.target.value as LedgerStatus)}
            className={selectClass}
          >
            {(Object.keys(STATUS_LABELS) as LedgerStatus[]).map((key) => (
              <option key={key} value={key}>
                {STATUS_LABELS[key]}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs text-slate-500">
            Từ
            <input
              type="date"
              value={fromDate}
              onChange={(event) => resetPage(setFromDate)(event.target.value)}
              className={selectClass}
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-500">
            Đến
            <input
              type="date"
              value={toDate}
              onChange={(event) => resetPage(setToDate)(event.target.value)}
              className={selectClass}
            />
          </label>
          <div className="relative flex-1 lg:max-w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Mã đơn, mã giao dịch, khách..."
              className="w-full rounded-xl bg-muted py-2 pl-9 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {invalidRange && (
          <div className="m-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Ngày bắt đầu không được sau ngày kết thúc.
          </div>
        )}

        <div className="overflow-x-auto">
          {query.isLoading ? (
            <div className="p-8 text-center text-sm text-slate-400">Đang tải sổ giao dịch...</div>
          ) : query.isError ? (
            <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {getApiErrorMessage(query.error, 'Không thể tải sổ giao dịch')}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <InboxIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-foreground">Không có giao dịch nào</h3>
              <p className="text-sm text-muted-foreground">Thử đổi bộ lọc hoặc khoảng ngày.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Mã giao dịch', 'Booking', 'Sân', 'Loại', 'Số tiền', 'Trạng thái', 'Thời gian', 'Biên lai'].map((col) => (
                    <th
                      key={col}
                      className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry) => (
                  <tr key={entry.transactionKey} className="text-sm transition-colors hover:bg-muted/30">
                    <td className="px-5 py-4">
                      <code className="rounded bg-muted px-2 py-1 font-mono text-xs">{entry.transactionCode}</code>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs">{entry.bookingCode}</td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{entry.courtName}</div>
                      <div className="text-xs text-muted-foreground">{entry.branchName}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div>{TYPE_LABELS[entry.transactionType] ?? entry.transactionType}</div>
                      <div className="text-xs text-muted-foreground">{METHOD_LABELS[entry.method] ?? entry.method}</div>
                    </td>
                    <td className={`px-5 py-4 font-bold ${entry.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                      {currency.format(entry.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASSES[entry.status]}`}>
                        {STATUS_LABELS[entry.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {new Date(entry.occurredAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-5 py-4">
                      {entry.receiptImageUrl ? (
                        <ViewerButton
                          url={entry.receiptImageUrl}
                          alt={`Biên lai ${entry.transactionCode ?? ''}`.trim()}
                          className="text-xs font-semibold text-emerald-700 underline"
                        >
                          Xem ảnh
                        </ViewerButton>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {(data?.totalElements ?? 0) > 0 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-xs text-muted-foreground">
              Hiển thị{' '}
              <span className="font-medium text-foreground">
                {page * PAGE_SIZE + 1}–{page * PAGE_SIZE + entries.length}
              </span>{' '}
              / {data?.totalElements} giao dịch
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((value) => Math.max(0, value - 1))}
                disabled={page === 0}
                aria-label="Trang trước"
                className="rounded-lg p-2 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="px-2 text-xs font-medium text-muted-foreground">
                {page + 1}/{totalPages}
              </span>
              <button
                onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
                disabled={page + 1 >= totalPages}
                aria-label="Trang sau"
                className="rounded-lg p-2 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, tone }: { label: string; value: number | undefined; tone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 text-xs font-medium text-muted-foreground">{label}</div>
      <div className={`text-xl font-bold ${tone}`}>{currency.format(value ?? 0)}</div>
    </div>
  )
}
