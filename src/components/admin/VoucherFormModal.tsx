import { useEffect, useState } from 'react'
import { X, Percent, Tag, ShieldCheck } from 'lucide-react'

import { getApiErrorMessage } from '@/common/utils/api-error'
import { useSaveVoucher } from '@/hooks/use-admin-vouchers'
import type { OwnerBranchOption } from '@/services/voucher/voucher.api'
import type { Voucher } from '@/types/voucher'
import {
  emptyVoucherFormValues,
  toVoucherRequest,
  validateVoucherForm,
  voucherToFormValues,
  type VoucherFormValues,
} from '@/pages/admin/vouchers/voucher-form.utils'

interface VoucherFormModalProps {
  isOpen: boolean
  voucher: Voucher | null
  branches: OwnerBranchOption[]
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
  const isEdit = !!voucher
  const [values, setValues] = useState<VoucherFormValues>(() => emptyVoucherFormValues(0))
  const [errorMsg, setErrorMsg] = useState('')
  const saveMutation = useSaveVoucher()

  useEffect(() => {
    if (!isOpen) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the form each time the modal opens
    setErrorMsg('')
    setValues(voucher ? voucherToFormValues(voucher) : emptyVoucherFormValues(branches[0]?.id ?? 0))
  }, [isOpen, voucher, branches])

  if (!isOpen) return null

  const isPending = saveMutation.isPending
  const set = <K extends keyof VoucherFormValues>(field: K, value: VoucherFormValues[K]) =>
    setValues((current) => ({ ...current, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const problem = validateVoucherForm(values, voucher?.usedCount ?? 0)
    if (problem) {
      setErrorMsg(problem)
      return
    }
    saveMutation.mutate(
      { id: voucher?.id, payload: toVoucherRequest(values) },
      {
        onSuccess: () => {
          onSuccess(isEdit ? 'Cập nhật mã giảm giá thành công.' : 'Tạo mã giảm giá thành công.')
          onClose()
        },
        onError: (error) =>
          setErrorMsg(getApiErrorMessage(error, isEdit ? 'Lỗi khi cập nhật mã giảm giá.' : 'Lỗi khi tạo mã giảm giá.')),
      },
    )
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
              value={values.branchId}
              onChange={(e) => set('branchId', Number(e.target.value))}
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
                value={values.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
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
                value={values.discountType}
                onChange={(e) => {
                  set('discountType', e.target.value as VoucherFormValues['discountType'])
                  set('discountValue', '')
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50"
              >
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">
                Giá trị giảm *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {values.discountType === 'PERCENTAGE' ? <Percent className="size-4" /> : 'đ'}
                </span>
                <input
                  type="number"
                  disabled={isPending}
                  value={values.discountValue}
                  onChange={(e) => set('discountValue', e.target.value)}
                  placeholder={values.discountType === 'PERCENTAGE' ? 'Ví dụ: 15' : 'Ví dụ: 30000'}
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
                value={values.minOrderAmount}
                onChange={(e) => set('minOrderAmount', e.target.value)}
                placeholder="Ví dụ: 100000"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Giảm tối đa (đ)</label>
              <input
                type="number"
                disabled={isPending || values.discountType === 'FIXED_AMOUNT'}
                value={values.discountType === 'FIXED_AMOUNT' ? '' : values.maxDiscountAmount}
                onChange={(e) => set('maxDiscountAmount', e.target.value)}
                placeholder={values.discountType === 'FIXED_AMOUNT' ? 'Không khả dụng' : 'Ví dụ: 50000'}
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
              value={values.usageLimit}
              onChange={(e) => set('usageLimit', e.target.value)}
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
                  value={values.startDate}
                  onChange={(e) => set('startDate', e.target.value)}
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
                  value={values.endDate}
                  onChange={(e) => set('endDate', e.target.value)}
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
                checked={values.active}
                onChange={(e) => set('active', e.target.checked)}
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
