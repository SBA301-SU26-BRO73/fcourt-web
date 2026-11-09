import { useState } from 'react'
import { Link2, Lock, RefreshCw, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { formatLocalDate } from '@/common/utils/local-date'
import { getApiErrorMessage } from '@/common/utils/api-error'
import { BranchSelect } from '@/components/admin/BranchSelect'
import { useBranchChoice } from '@/hooks/use-branch-choice'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import {
  useBranchCourts,
  useCancelFullCourt,
  useCreateFullCourt,
  useFullCourtPackages,
  useQuoteFullCourt,
  useRelockFullCourt,
} from '@/hooks/use-admin-bookings'
import { newIdempotencyKey } from '@/services/booking/booking.api'
import type { FullCourtPackage, FullCourtQuote, FullCourtState } from '@/types/admin-booking'

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

const STATE_LABELS: Record<FullCourtState, string> = {
  RESERVING: 'Đang giữ chỗ',
  BOOKED: 'Đã đặt, chờ khóa',
  COMMITTED: 'Đã xác nhận',
  FAILED: 'Thất bại',
  LOCK_LOST: 'Mất khóa, cần khóa lại',
  CANCELLING: 'Đang hủy',
  CANCELLED: 'Đã hủy',
}

const STATE_CLASSES: Record<FullCourtState, string> = {
  RESERVING: 'bg-blue-50 text-blue-700 border border-blue-200',
  BOOKED: 'bg-blue-50 text-blue-700 border border-blue-200',
  COMMITTED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  FAILED: 'bg-red-50 text-red-600 border border-red-200',
  LOCK_LOST: 'bg-amber-50 text-amber-700 border border-amber-200',
  CANCELLING: 'bg-amber-50 text-amber-700 border border-amber-200',
  CANCELLED: 'bg-slate-50 text-slate-600 border border-slate-200',
}

const inputClass =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'

const PAGE_SIZE = 10

export function AdminFullCourtPage() {
  const { branches, branchId, setBranchId } = useBranchChoice()
  const courtsQuery = useBranchCourts(branchId)
  const [courtIds, setCourtIds] = useState<number[]>([])
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [quote, setQuote] = useState<FullCourtQuote | null>(null)
  // One key per form content: a retry after a lost response replays the same package.
  const [idempotencyKey, setIdempotencyKey] = useState(() => newIdempotencyKey())

  const [stateFilter, setStateFilter] = useState<FullCourtState | ''>('')
  const [page, setPage] = useState(0)
  const [cancelling, setCancelling] = useState<FullCourtPackage | null>(null)

  const listQuery = useFullCourtPackages({ state: stateFilter || undefined, page, size: PAGE_SIZE })
  const quoteMutation = useQuoteFullCourt()
  const createMutation = useCreateFullCourt()
  const cancelMutation = useCancelFullCourt()
  const relockMutation = useRelockFullCourt()

  const courts = (courtsQuery.data ?? []).filter((court) => court.status === 'ACTIVE')
  const branchNames = new Map(branches.map((branch) => [branch.id, branch.name]))
  const packages = listQuery.data ?? []

  const touchForm = () => {
    setQuote(null)
    setIdempotencyKey(newIdempotencyKey())
  }

  const toggleCourt = (id: number) => {
    setCourtIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
    touchForm()
  }

  const windowReady = branchId !== undefined && courtIds.length > 0 && date && startTime && endTime && startTime < endTime
  const contactReady = contactName.trim().length > 0 && /^\+?[0-9]{9,15}$/.test(contactPhone.trim())

  const window = windowReady ? { branchId, courtIds, date, startTime, endTime } : null

  const handleQuote = () => {
    if (!window) return
    quoteMutation.mutate(window, {
      onSuccess: setQuote,
      onError: (error) => toast.error(getApiErrorMessage(error, 'Không thể tính giá đặt cả sân')),
    })
  }

  const handleCreate = () => {
    if (!window) return
    createMutation.mutate(
      { request: { ...window, contactName, contactPhone }, key: idempotencyKey },
      {
        onSuccess: ({ pending }) => {
          toast.success(
            pending
              ? 'Đã tạo booking, hệ thống đang xác nhận khóa sân. Kiểm tra lại trong danh sách.'
              : 'Đã đặt cả sân thành công',
          )
          setCourtIds([])
          setDate('')
          setStartTime('')
          setEndTime('')
          setContactName('')
          setContactPhone('')
          touchForm()
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'Không thể đặt cả sân')),
      },
    )
  }

  const handleCancel = (reason: string) => {
    if (!cancelling) return
    cancelMutation.mutate(
      { packageId: cancelling.packageId, reason },
      {
        onSuccess: ({ pending }) => {
          toast.success(
            pending ? 'Đã hủy các booking, việc nhả khóa sân đang chờ xử lý (sẽ tự thử lại)' : 'Đã hủy gói đặt cả sân',
          )
          setCancelling(null)
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'Không thể hủy gói đặt cả sân')),
      },
    )
  }

  const handleRelock = (pkg: FullCourtPackage) =>
    relockMutation.mutate(pkg.packageId, {
      onSuccess: ({ pending }) =>
        toast.success(pending ? 'Đang khóa lại sân, kiểm tra lại sau ít phút' : 'Đã khóa lại sân'),
      onError: (error) => toast.error(getApiErrorMessage(error, 'Không thể khóa lại sân')),
    })

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đặt cả sân</h1>
          <p className="mt-1 text-sm text-slate-500">
            Giữ nhiều sân của chi nhánh trong một khung giờ cho khách (sự kiện, giải đấu).
          </p>
        </div>
        <BranchSelect
          branches={branches}
          value={branchId}
          onChange={(id) => {
            setBranchId(id)
            setCourtIds([])
            touchForm()
          }}
        />
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800">Tạo gói đặt cả sân</h2>

        <div>
          <div className="mb-2 text-xs font-semibold text-slate-500">Chọn sân</div>
          {courtsQuery.isLoading ? (
            <div className="text-sm text-slate-400">Đang tải danh sách sân...</div>
          ) : courts.length === 0 ? (
            <div className="text-sm text-slate-400">Chi nhánh chưa có sân đang hoạt động.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {courts.map((court) => (
                <label
                  key={court.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                    courtIds.includes(court.id)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={courtIds.includes(court.id)}
                    onChange={() => toggleCourt(court.id)}
                    className="accent-emerald-700"
                  />
                  {court.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-xs font-semibold text-slate-500">
            Ngày
            <input
              type="date"
              value={date}
              min={formatLocalDate(new Date())}
              onChange={(event) => {
                setDate(event.target.value)
                touchForm()
              }}
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="text-xs font-semibold text-slate-500">
            Giờ bắt đầu
            <input
              type="time"
              step={1800}
              value={startTime}
              onChange={(event) => {
                setStartTime(event.target.value)
                touchForm()
              }}
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="text-xs font-semibold text-slate-500">
            Giờ kết thúc
            <input
              type="time"
              step={1800}
              value={endTime}
              onChange={(event) => {
                setEndTime(event.target.value)
                touchForm()
              }}
              className={`${inputClass} mt-1`}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-500">
            Tên người liên hệ
            <input
              value={contactName}
              maxLength={150}
              onChange={(event) => {
                setContactName(event.target.value)
                setIdempotencyKey(newIdempotencyKey())
              }}
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="text-xs font-semibold text-slate-500">
            Số điện thoại
            <input
              value={contactPhone}
              inputMode="tel"
              onChange={(event) => {
                setContactPhone(event.target.value)
                setIdempotencyKey(newIdempotencyKey())
              }}
              className={`${inputClass} mt-1`}
            />
          </label>
        </div>

        {quote && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
            <div className="flex justify-between">
              <span>Tổng giờ sân</span>
              <span className="font-semibold">{quote.courtHours} giờ</span>
            </div>
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span className="font-semibold">{currency.format(quote.subtotal)}</span>
            </div>
            {quote.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Giảm giá đặt dài ({quote.discountPercent}%)</span>
                <span className="font-semibold">-{currency.format(quote.discountAmount)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-primary/20 pt-2 text-base font-bold text-primary">
              <span>Tổng cộng</span>
              <span>{currency.format(quote.total)}</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleQuote}
            disabled={!window || quoteMutation.isPending}
            className="rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {quoteMutation.isPending ? 'Đang tính...' : 'Tính giá'}
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!window || !contactReady || createMutation.isPending}
            style={{ backgroundColor: '#006d38' }}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMutation.isPending ? 'Đang đặt...' : 'Đặt cả sân'}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold text-slate-800">Các gói đã đặt</h2>
          <div className="flex items-center gap-2">
            <select
              aria-label="Lọc theo trạng thái"
              value={stateFilter}
              onChange={(event) => {
                setStateFilter(event.target.value as FullCourtState | '')
                setPage(0)
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              {(Object.keys(STATE_LABELS) as FullCourtState[]).map((state) => (
                <option key={state} value={state}>
                  {STATE_LABELS[state]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => listQuery.refetch()}
              disabled={listQuery.isFetching}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-muted"
            >
              <RefreshCw size={15} className={listQuery.isFetching ? 'animate-spin' : ''} />
              Làm mới
            </button>
          </div>
        </div>

        {listQuery.isLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Đang tải...</div>
        ) : listQuery.isError ? (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {getApiErrorMessage(listQuery.error, 'Không thể tải danh sách gói đặt cả sân')}
          </div>
        ) : packages.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Chưa có gói đặt cả sân nào.</div>
        ) : (
          <div className="divide-y divide-border">
            {packages.map((pkg) => (
              <PackageRow
                key={pkg.packageId}
                pkg={pkg}
                branchName={branchNames.get(pkg.branchId) ?? `Chi nhánh #${pkg.branchId}`}
                busy={cancelMutation.isPending || relockMutation.isPending}
                onCancel={() => setCancelling(pkg)}
                onRelock={() => handleRelock(pkg)}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border px-6 py-3 text-sm text-slate-500">
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
              disabled={packages.length < PAGE_SIZE}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {cancelling && (
        <ConfirmModal
          open
          action="cancel_package"
          bookingCode={cancelling.bookings[0]?.bookingCode ?? cancelling.packageId.slice(0, 8)}
          loading={cancelMutation.isPending}
          onConfirm={handleCancel}
          onCancel={() => !cancelMutation.isPending && setCancelling(null)}
        />
      )}
    </div>
  )
}

function PackageRow({
  pkg,
  branchName,
  busy,
  onCancel,
  onRelock,
}: {
  pkg: FullCourtPackage
  branchName: string
  busy: boolean
  onCancel: () => void
  onRelock: () => void
}) {
  const canCancel = pkg.state === 'COMMITTED' || pkg.state === 'BOOKED' || pkg.state === 'LOCK_LOST' || pkg.state === 'CANCELLING'
  const canRelock = pkg.state === 'LOCK_LOST' || pkg.state === 'BOOKED'

  return (
    <div className="flex flex-col gap-3 px-6 py-4 text-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-900">{branchName}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATE_CLASSES[pkg.state]}`}>
            {STATE_LABELS[pkg.state]}
          </span>
        </div>
        <div className="text-slate-600">
          {pkg.date} · {pkg.startTime.slice(0, 5)} - {pkg.endTime.slice(0, 5)} · {pkg.courtIds.length} sân ·{' '}
          {currency.format(pkg.total)}
        </div>
        <div className="text-xs text-slate-500">
          {pkg.contactName} · {pkg.contactPhone}
          {pkg.cancellationReason ? ` · Lý do hủy: ${pkg.cancellationReason}` : ''}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {pkg.bookings.map((booking) => (
            <code key={booking.bookingId} className="rounded bg-muted px-2 py-0.5 font-mono text-[11px]">
              {booking.bookingCode}
            </code>
          ))}
        </div>
      </div>
      <div className="flex flex-shrink-0 gap-2">
        {canRelock && (
          <button
            type="button"
            disabled={busy}
            onClick={onRelock}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
          >
            <Lock size={14} />
            Khóa lại
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
          >
            <XCircle size={14} />
            {pkg.state === 'CANCELLING' ? 'Thử nhả khóa lại' : 'Hủy gói'}
          </button>
        )}
        {!canCancel && !canRelock && <Link2 size={14} className="text-slate-300" />}
      </div>
    </div>
  )
}
