import { useState } from 'react'
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Ticket,
  SlidersHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Power,
  User,
  Phone,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  useDeleteVoucher,
  useOwnerBranches,
  useSetVoucherStatus,
  useVoucherUsages,
  useVouchers,
} from '@/hooks/use-admin-vouchers'
import type { Voucher } from '@/types/voucher'
import VoucherFormModal from '@/components/admin/VoucherFormModal'
import { getApiErrorMessage, toastApiError } from '@/common/utils/api-error'

export default function AdminVoucherPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'history'>('list')
  
  // Voucher List states
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  
  // Usage history states (the backend lists usages per voucher)
  const [historyPage, setHistoryPage] = useState(0)
  const [historySize] = useState(10)
  const [historyVoucherId, setHistoryVoucherId] = useState<number | null>(null)
  const [historyPhone, setHistoryPhone] = useState('')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)

  // Fetch vouchers
  const voucherQuery = useVouchers({ page, size }, activeTab === 'list')
  // Voucher picker of the history tab
  const pickerQuery = useVouchers({ page: 0, size: 100 }, activeTab === 'history')
  const pickerVouchers = pickerQuery.data?.content ?? []
  const effectiveHistoryVoucherId = historyVoucherId ?? pickerVouchers[0]?.id ?? null
  const historyQuery = useVoucherUsages(effectiveHistoryVoucherId, {
    page: historyPage,
    size: historySize,
    phone: historyPhone,
  })

  // Fetch admin branches for dropdowns
  const branchQuery = useOwnerBranches()

  const deleteMutation = useDeleteVoucher()
  const statusMutation = useSetVoucherStatus()

  const triggerSuccessMessage = (msg: string) => {
    setSuccessMessage(msg)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const timer = setTimeout(() => setSuccessMessage(''), 5000)
    return () => clearTimeout(timer)
  }

  const handleDelete = (voucher: Voucher) => {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa mã giảm giá "${voucher.code}" không?`)
    if (!confirmed) return
    deleteMutation.mutate(voucher.id, {
      onSuccess: () => {
        if (voucherQuery.data?.numberOfElements === 1 && page > 0) setPage((curr) => curr - 1)
        setDeleteError(null)
        triggerSuccessMessage('Xóa mã giảm giá thành công.')
      },
      onError: (error) => setDeleteError(getApiErrorMessage(error, 'Không thể xóa mã giảm giá.')),
    })
  }

  // There is no disable endpoint: switching off is a PUT with status EXPIRED.
  const handleToggle = (voucher: Voucher) => {
    const next = voucher.status === 'ACTIVE' ? 'EXPIRED' : 'ACTIVE'
    statusMutation.mutate(
      { voucher, status: next },
      {
        onSuccess: () => toast.success(next === 'ACTIVE' ? 'Đã bật mã giảm giá.' : 'Đã tắt mã giảm giá.'),
        onError: (error) => toastApiError(error, 'Không thể đổi trạng thái mã giảm giá.'),
      },
    )
  }

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedVoucher(null)
    setIsModalOpen(true)
  }

  const branches = branchQuery.data ?? []
  const branchNames = new Map(branches.map((branch) => [branch.id, branch.name]))
  const branchNameOf = (voucher: Voucher) => branchNames.get(voucher.branchId) ?? `Chi nhánh #${voucher.branchId}`
  const data = voucherQuery.data
  const historyData = historyQuery.data

  const filteredVouchers = (() => {
    const q = searchTerm.trim().toLowerCase()
    const all = data?.content ?? []
    if (!q) return all
    return all.filter((v) => v.code.toLowerCase().includes(q) || branchNameOf(v).toLowerCase().includes(q))
  })()

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'Không'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '-'
    const d = new Date(isoStr)
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Check if voucher is valid (active, within date, usage not exceeded)
  const isVoucherValidNow = (v: Voucher) => {
    if (v.status !== 'ACTIVE') return false
    if (v.usedCount >= v.usageLimit) return false
    const now = new Date()
    const start = new Date(v.startDate)
    const expiry = new Date(v.endDate)
    return now >= start && now <= expiry
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý mã giảm giá (Voucher)</h1>
              <p className="text-sm text-slate-500 mt-1">Tạo và quản lý các chương trình ưu đãi cho từng chi nhánh</p>
            </div>
            {activeTab === 'list' && (
              <button
                type="button"
                onClick={handleCreate}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <Plus className="size-5" /> Thêm mã giảm giá
              </button>
            )}
          </div>

          {/* Tab Headers */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('list')
                setSearchTerm('')
              }}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
                activeTab === 'list'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Danh sách mã giảm giá
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('history')
                setSearchTerm('')
              }}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
                activeTab === 'history'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Lịch sử sử dụng
            </button>
          </div>

        {/* Success Alert */}
        {successMessage && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
          >
            {successMessage}
          </div>
        )}
        {deleteError && (
          <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {deleteError}
          </div>
        )}

        {/* Filter / Search Bar */}
        <div className="mt-6 flex items-center gap-3">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Tìm kiếm</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === 'list'
                  ? 'Tìm kiếm theo mã code hoặc chi nhánh áp dụng...'
                  : 'Dùng ô lọc số điện thoại bên dưới để tìm theo khách hàng...'
              }
              className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-white pl-12 pr-4 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50"
            />
          </label>
          {activeTab === 'list' && (
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`grid size-12 shrink-0 place-items-center rounded-xl border bg-white transition hover:border-green-600 hover:text-green-700 ${
                showFilters ? 'border-green-600 text-green-700 shadow-sm' : 'border-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              <SlidersHorizontal className="size-5" />
            </button>
          )}
        </div>

        {/* Dynamic Filters panel (only list tab) */}
        {showFilters && activeTab === 'list' && (
          <div className="mt-3 grid gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold text-[#374151]">
              <span className="block">Số dòng hiển thị</span>
              <select
                value={String(size)}
                onChange={(e) => {
                  setSize(Number(e.target.value))
                  setPage(0)
                }}
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 font-normal outline-none focus:border-green-600"
              >
                {[5, 10, 25, 50].map((v) => (
                  <option key={v} value={String(v)}>
                    {v} dòng
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end justify-end pb-1 text-xs text-slate-500">
              Tổng số chi nhánh bạn đang sở hữu: <strong className="ml-1 text-slate-700">{branches.length}</strong>
            </div>
          </div>
        )}

        {/* Tab 1: Voucher List */}
        {activeTab === 'list' && (
          <>
            {voucherQuery.isPending ? (
              <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white px-6 py-16 text-center shadow-sm">
                <h2 className="text-lg font-bold">Đang tải danh sách mã giảm giá...</h2>
              </div>
            ) : voucherQuery.isError ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
                <h2 className="text-lg font-bold text-red-800">Không thể tải danh sách mã giảm giá</h2>
                <button
                  type="button"
                  onClick={() => void voucherQuery.refetch()}
                  className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800"
                >
                  Thử lại
                </button>
              </div>
            ) : !data || data.content.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <Ticket className="mx-auto size-12 text-slate-400 mb-3" />
                <h2 className="text-lg font-bold text-slate-800">Chưa có mã giảm giá nào</h2>
                <p className="mt-1 text-sm text-slate-500">Bắt đầu tạo mã giảm giá đầu tiên để thu hút khách hàng.</p>
              </div>
            ) : filteredVouchers.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white px-6 py-16 text-center">
                <h2 className="text-lg font-bold">Không tìm thấy mã giảm giá phù hợp</h2>
                <p className="mt-1 text-sm text-slate-500">Thử tìm kiếm với một từ khóa khác.</p>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-slate-500">
                    <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-700 border-b border-slate-100">
                      <tr>
                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Mã Code</th>
                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Cơ sở áp dụng</th>
                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Mức Giảm</th>
                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Đơn tối thiểu / Tối đa</th>
                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Đã dùng / Giới hạn</th>
                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Thời gian hiệu lực</th>
                        <th scope="col" className="px-6 py-4 whitespace-nowrap">Trạng thái</th>
                        <th scope="col" className="px-6 py-4 text-right whitespace-nowrap">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredVouchers.map((voucher) => {
                        const isValid = isVoucherValidNow(voucher)
                        return (
                          <tr key={voucher.id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-2 py-1 text-xs font-bold text-green-700 border border-green-200 uppercase">
                                  <Ticket className="size-3.5" />
                                  {voucher.code}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-900">
                              {branchNameOf(voucher)}
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-800">
                              {voucher.discountType === 'PERCENTAGE' ? (
                                <span className="text-emerald-700">{voucher.discountValue}%</span>
                              ) : (
                                <span className="text-blue-700">{formatCurrency(voucher.discountValue)}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs">
                              <div>Tối thiểu: {formatCurrency(voucher.minOrderAmount || null)}</div>
                              {voucher.discountType === 'PERCENTAGE' && (
                                <div className="mt-0.5 text-slate-400">
                                  Tối đa: {formatCurrency(voucher.maxDiscountAmount)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="w-24">
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                                  <span>{voucher.usedCount}</span>
                                  <span className="text-slate-400">/ {voucher.usageLimit}</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      voucher.usedCount >= voucher.usageLimit ? 'bg-red-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(100, (voucher.usedCount / voucher.usageLimit) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs space-y-0.5">
                              <div className="flex items-center gap-1 text-slate-500">
                                <span className="font-semibold text-slate-700">Từ:</span>
                                {formatDate(voucher.startDate)}
                              </div>
                              <div className="flex items-center gap-1 text-slate-500">
                                <span className="font-semibold text-slate-700">Đến:</span>
                                {formatDate(voucher.endDate)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {isValid ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">
                                  <CheckCircle className="size-3" /> Đang chạy
                                </span>
                              ) : voucher.status === 'ACTIVE' && voucher.usedCount < voucher.usageLimit && new Date(voucher.startDate) > new Date() ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                                  <Clock className="size-3" /> Chưa bắt đầu
                                </span>
                              ) : voucher.status === 'EXPIRED' && new Date(voucher.endDate) > new Date() ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                                  <XCircle className="size-3" /> Tắt hoạt động
                                </span>
                              ) : voucher.usedCount >= voucher.usageLimit ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
                                  <XCircle className="size-3" /> Hết lượt
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                                  <XCircle className="size-3" /> Hết hạn
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(voucher)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                  title="Chỉnh sửa"
                                >
                                  <Pencil className="size-4.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={statusMutation.isPending}
                                  onClick={() => handleToggle(voucher)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                  title={voucher.status === 'ACTIVE' ? 'Tắt mã' : 'Bật mã'}
                                >
                                  <Power className="size-4.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(voucher)}
                                  className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-700"
                                  title="Xóa mã"
                                >
                                  <Trash2 className="size-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {data && data.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 text-slate-500 text-sm">
                    <button
                      type="button"
                      disabled={data.first || voucherQuery.isFetching}
                      onClick={() => setPage((current) => Math.max(0, current - 1))}
                      className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 font-bold text-[#111827] hover:border-green-600 disabled:cursor-not-allowed disabled:opacity-40 transition"
                    >
                      Trang trước
                    </button>
                    <span className="font-semibold">
                      Trang {data.number + 1} / {data.totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={data.last || voucherQuery.isFetching}
                      onClick={() => setPage((current) => current + 1)}
                      className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 font-bold text-[#111827] hover:border-green-600 disabled:cursor-not-allowed disabled:opacity-40 transition"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Tab 2: Voucher Usage History (per voucher) */}
        {activeTab === 'history' && (
          <>
            <div className="mt-3 grid gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-semibold text-[#374151]">
                <span className="block">Mã giảm giá</span>
                <select
                  value={effectiveHistoryVoucherId ?? ''}
                  onChange={(e) => {
                    setHistoryVoucherId(Number(e.target.value))
                    setHistoryPage(0)
                  }}
                  className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 font-normal outline-none focus:border-green-600"
                >
                  {pickerVouchers.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.code} - {branchNameOf(v)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-semibold text-[#374151]">
                <span className="block">Số điện thoại khách</span>
                <input
                  type="search"
                  value={historyPhone}
                  onChange={(e) => {
                    setHistoryPhone(e.target.value)
                    setHistoryPage(0)
                  }}
                  placeholder="Lọc theo số điện thoại"
                  className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 font-normal outline-none focus:border-green-600"
                />
              </label>
            </div>

            {pickerQuery.isPending || (effectiveHistoryVoucherId !== null && historyQuery.isPending) ? (
              <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-white px-6 py-16 text-center shadow-sm">
                <h2 className="text-lg font-bold">Đang tải lịch sử sử dụng voucher...</h2>
              </div>
            ) : pickerQuery.isError || historyQuery.isError ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
                <h2 className="text-lg font-bold text-red-800">Không thể tải lịch sử sử dụng voucher</h2>
                <button
                  type="button"
                  onClick={() => void (pickerQuery.isError ? pickerQuery.refetch() : historyQuery.refetch())}
                  className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800"
                >
                  Thử lại
                </button>
              </div>
            ) : !historyData || historyData.content.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <Clock className="mx-auto size-12 text-slate-400 mb-3" />
                <h2 className="text-lg font-bold text-slate-800">Chưa có lịch sử sử dụng</h2>
                <p className="mt-1 text-sm text-slate-500">Khi khách hàng áp dụng voucher để đặt sân, lịch sử sử dụng sẽ xuất hiện ở đây.</p>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-3 text-sm text-slate-600">
                  Tổng số tiền đã giảm:{' '}
                  <strong className="text-red-600">{formatCurrency(historyData.totalDiscountAmount)}</strong>
                  {' '}({historyData.totalElements} lượt)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-slate-500">
                    <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-700 border-b border-slate-100">
                      <tr>
                        <th scope="col" className="px-3 py-4 whitespace-nowrap">Mã đặt sân</th>
                        <th scope="col" className="px-3 py-4 whitespace-nowrap">Khách hàng</th>
                        <th scope="col" className="px-3 py-4 text-right whitespace-nowrap">Số tiền giảm</th>
                        <th scope="col" className="px-3 py-4 whitespace-nowrap">Thời điểm dùng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historyData.content.map((usage) => (
                        <tr key={usage.id} className="hover:bg-slate-50 transition">
                          <td className="px-3 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-2 py-1 text-xs font-bold text-green-700 border border-green-200 uppercase">
                              <Ticket className="size-3.5" />
                              {usage.bookingCode ?? `#${usage.bookingId}`}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-xs">
                            <div className="flex items-center gap-1 text-slate-900 font-bold">
                              <User className="size-3 text-slate-400" />
                              {usage.customerName || 'Khách vãng lai'}
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                              <Phone className="size-3" />
                              {usage.customerPhone || 'N/A'}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-right font-semibold text-red-600">
                            -{formatCurrency(usage.discountAmount)}
                          </td>
                          <td className="px-3 py-4 text-xs">{formatDate(usage.usedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* History Pagination */}
                {historyData.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4 text-slate-500 text-sm">
                    <button
                      type="button"
                      disabled={historyData.first || historyQuery.isFetching}
                      onClick={() => setHistoryPage((current) => Math.max(0, current - 1))}
                      className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 font-bold text-[#111827] hover:border-green-600 disabled:cursor-not-allowed disabled:opacity-40 transition"
                    >
                      Trang trước
                    </button>
                    <span className="font-semibold">
                      Trang {historyData.number + 1} / {historyData.totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={historyData.last || historyQuery.isFetching}
                      onClick={() => setHistoryPage((current) => current + 1)}
                      className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 font-bold text-[#111827] hover:border-green-600 disabled:cursor-not-allowed disabled:opacity-40 transition"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

      {/* Form Modal */}
      <VoucherFormModal
        isOpen={isModalOpen}
        voucher={selectedVoucher}
        branches={branches}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(msg) => triggerSuccessMessage(msg)}
      />
    </div>
  )
}
