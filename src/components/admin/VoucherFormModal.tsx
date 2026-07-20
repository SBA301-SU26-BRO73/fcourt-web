import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Percent, Tag, ShieldCheck } from 'lucide-react'

import { createVoucher, updateVoucher } from '@/services/voucher/voucher.api'
import type { Voucher, CreateVoucherRequest, UpdateVoucherRequest } from '@/types/voucher'
import type { Branch } from '@/types/branch'
import { formatLocalDateTime } from '@/common/utils/local-date'

interface VoucherFormModalProps {
  isOpen: boolean
  voucher: Voucher | null
  branches: Branch[]
  onClose: () => void
  onSuccess: (message: string) => void
}

export default function VoucherFormModal({
  isOpen,
  voucher,
  branches,
  onClose,
  onSuccess,
}: VoucherFormModalProps) {
  const queryClient = useQueryClient()
  const isEdit = !!voucher

  // Form states
  const [branchId, setBranchId] = useState<number>(0)
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE')
  const [discountValue, setDiscountValue] = useState<number>(0)
  const [minOrderValue, setMinOrderValue] = useState<string>('')
  const [maxDiscountValue, setMaxDiscountValue] = useState<string>('')
  const [usageLimit, setUsageLimit] = useState<number>(10)
  const [startDate, setStartDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [active, setActive] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('')
      if (voucher) {
        setBranchId(voucher.branchId)
        setCode(voucher.code)
        setDiscountType(voucher.discountType)
        setDiscountValue(voucher.discountValue)
        setMinOrderValue(voucher.minOrderValue ? String(voucher.minOrderValue) : '')
        setMaxDiscountValue(voucher.maxDiscountValue ? String(voucher.maxDiscountValue) : '')
        setUsageLimit(voucher.usageLimit)
        
        // Format ISO dates to datetime-local (yyyy-MM-ddThh:mm)
        setStartDate(voucher.startDate ? formatLocalDateTime(new Date(voucher.startDate)) : '')
        setExpiryDate(voucher.expiryDate ? formatLocalDateTime(new Date(voucher.expiryDate)) : '')
        setActive(voucher.active)
      } else {
        setBranchId(branches[0]?.id || 0)
        setCode('')
        setDiscountType('PERCENTAGE')
        setDiscountValue(0)
        setMinOrderValue('')
        setMaxDiscountValue('')
        setUsageLimit(10)
        
        // Default start date = now, expiry = 30 days from now
        const now = new Date()
        const future = new Date()
        future.setDate(now.getDate() + 30)
        setStartDate(now.toISOString().slice(0, 16))
        setExpiryDate(future.toISOString().slice(0, 16))
        setActive(true)
      }
    }
  }, [isOpen, voucher, branches])

  const createMutation = useMutation({
    mutationFn: createVoucher,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      onSuccess('Tạo mã giảm giá thành công.')
      onClose()
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Lỗi khi tạo mã giảm giá.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateVoucherRequest }) =>
      updateVoucher(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      onSuccess('Cập nhật mã giảm giá thành công.')
      onClose()
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Lỗi khi cập nhật mã giảm giá.')
    },
  })

  if (!isOpen) return null

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!code.trim()) {
      setErrorMsg('Vui lòng nhập mã giảm giá.')
      return
    }

    if (discountValue <= 0) {
      setErrorMsg('Giá trị giảm phải lớn hơn 0.')
      return
    }

    if (discountType === 'PERCENTAGE' && discountValue > 100) {
      setErrorMsg('Phần trăm giảm giá không được vượt quá 100%.')
      return
    }

    const start = new Date(startDate)
    const end = new Date(expiryDate)
    if (end <= start) {
      setErrorMsg('Ngày hết hạn phải sau ngày bắt đầu.')
      return
    }

    if (!isEdit && branchId === 0) {
      setErrorMsg('Vui lòng chọn cơ sở áp dụng.')
      return
    }

    // Format dates to ISO String (OffsetDateTime)
    const formattedStart = start.toISOString()
    const formattedEnd = end.toISOString()

    if (isEdit && voucher) {
      const payload: UpdateVoucherRequest = {
        discountType,
        discountValue,
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        maxDiscountValue: maxDiscountValue ? Number(maxDiscountValue) : undefined,
        usageLimit,
        startDate: formattedStart,
        expiryDate: formattedEnd,
        active,
      }
      updateMutation.mutate({ id: voucher.id, payload })
    } else {
      const payload: CreateVoucherRequest = {
        branchId,
        code: code.trim().toUpperCase(),
        discountType,
        discountValue,
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        maxDiscountValue: maxDiscountValue ? Number(maxDiscountValue) : undefined,
        usageLimit,
        startDate: formattedStart,
        expiryDate: formattedEnd,
      }
      createMutation.mutate(payload)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose()
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? `Chỉnh sửa mã: ${voucher.code}` : 'Thêm mã giảm giá mới'}
          </h2>
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
              {errorMsg}
            </div>
          )}

          {/* Branch select (disabled on Edit) */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Cơ sở áp dụng *</label>
            <select
              disabled={isEdit || isPending}
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50 disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="0" disabled>-- Chọn cơ sở --</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Voucher Code */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Mã giảm giá (Code) *</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                disabled={isEdit || isPending}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ví dụ: SUMMER20, KM50K"
                className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50 uppercase disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Loại giảm giá *</label>
              <select
                disabled={isPending}
                value={discountType}
                onChange={(e) => {
                  setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED')
                  setDiscountValue(0)
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50"
              >
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED">Số tiền cố định (đ)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">
                Giá trị giảm *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {discountType === 'PERCENTAGE' ? <Percent className="size-4" /> : 'đ'}
                </span>
                <input
                  type="number"
                  disabled={isPending}
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  placeholder={discountType === 'PERCENTAGE' ? 'Ví dụ: 15' : 'Ví dụ: 30000'}
                  className="h-11 w-full rounded-xl border border-slate-200 pl-8 pr-4 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50"
                />
              </div>
            </div>
          </div>

          {/* Min Order & Max Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Đơn hàng tối thiểu (đ)</label>
              <input
                type="number"
                disabled={isPending}
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                placeholder="Ví dụ: 100000"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Giảm tối đa (đ)</label>
              <input
                type="number"
                disabled={isPending || discountType === 'FIXED'}
                value={discountType === 'FIXED' ? '' : maxDiscountValue}
                onChange={(e) => setMaxDiscountValue(e.target.value)}
                placeholder={discountType === 'FIXED' ? 'Không khả dụng' : 'Ví dụ: 50000'}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>

          {/* Usage Limit */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Tổng số lượt sử dụng tối đa *</label>
            <input
              type="number"
              disabled={isPending}
              value={usageLimit}
              onChange={(e) => setUsageLimit(Number(e.target.value))}
              placeholder="Ví dụ: 100"
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Ngày bắt đầu *</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  disabled={isPending}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Ngày kết thúc *</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  disabled={isPending}
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50"
                />
              </div>
            </div>
          </div>

          {/* Active toggle status (Only when editing) */}
          {isEdit && (
            <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
              <input
                type="checkbox"
                id="voucher-active-toggle"
                disabled={isPending}
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="size-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="voucher-active-toggle" className="text-sm font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
                <ShieldCheck className="size-4 text-green-600" /> Kích hoạt hoạt động
              </label>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 mt-6">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-11 rounded-xl bg-green-600 px-6 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
