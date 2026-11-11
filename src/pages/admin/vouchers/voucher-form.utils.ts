import { formatLocalDateTime } from '@/common/utils/local-date'
import type { Voucher, VoucherDiscountType, VoucherRequest } from '@/types/voucher'

export interface VoucherFormValues {
  branchId: number
  code: string
  discountType: VoucherDiscountType
  discountValue: string
  minOrderAmount: string
  maxDiscountAmount: string
  usageLimit: string
  /** `datetime-local` value, local time */
  startDate: string
  endDate: string
  active: boolean
}

export function emptyVoucherFormValues(branchId: number, now = new Date()): VoucherFormValues {
  const end = new Date(now)
  end.setDate(now.getDate() + 30)
  return {
    branchId,
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '10',
    startDate: formatLocalDateTime(now),
    endDate: formatLocalDateTime(end),
    active: true,
  }
}

export function voucherToFormValues(voucher: Voucher): VoucherFormValues {
  return {
    branchId: voucher.branchId,
    code: voucher.code,
    discountType: voucher.discountType,
    discountValue: String(voucher.discountValue),
    minOrderAmount: voucher.minOrderAmount ? String(voucher.minOrderAmount) : '',
    maxDiscountAmount: voucher.maxDiscountAmount ? String(voucher.maxDiscountAmount) : '',
    usageLimit: String(voucher.usageLimit),
    startDate: voucher.startDate ? formatLocalDateTime(new Date(voucher.startDate)) : '',
    endDate: voucher.endDate ? formatLocalDateTime(new Date(voucher.endDate)) : '',
    active: voucher.status === 'ACTIVE',
  }
}

const CODE_PATTERN = /^[A-Z0-9_-]{1,50}$/

/** Returns the first problem as a message, or null when the form can be sent. */
export function validateVoucherForm(values: VoucherFormValues, usedCount = 0): string | null {
  const code = values.code.trim().toUpperCase()
  if (!code) return 'Vui lòng nhập mã giảm giá.'
  if (!CODE_PATTERN.test(code)) return 'Mã chỉ gồm chữ in hoa, số, dấu gạch ngang hoặc gạch dưới (tối đa 50 ký tự).'
  if (!values.branchId) return 'Vui lòng chọn cơ sở áp dụng.'

  const discount = Number(values.discountValue)
  if (!values.discountValue || !Number.isFinite(discount) || discount < 0.01) return 'Giá trị giảm phải lớn hơn 0.'
  if (values.discountType === 'PERCENTAGE' && discount > 100) return 'Phần trăm giảm giá không được vượt quá 100%.'

  if (values.minOrderAmount && !(Number(values.minOrderAmount) >= 0)) return 'Đơn hàng tối thiểu không được âm.'
  if (values.discountType === 'PERCENTAGE' && values.maxDiscountAmount && !(Number(values.maxDiscountAmount) >= 0.01)) {
    return 'Mức giảm tối đa phải lớn hơn 0.'
  }

  const limit = Number(values.usageLimit)
  if (!Number.isInteger(limit) || limit < 1) return 'Tổng số lượt sử dụng phải là số nguyên từ 1 trở lên.'
  if (limit < usedCount) return `Số lượt tối đa không được nhỏ hơn số lượt đã dùng (${usedCount}).`

  const start = new Date(values.startDate)
  const end = new Date(values.endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Vui lòng chọn thời gian hiệu lực.'
  if (end <= start) return 'Ngày hết hạn phải sau ngày bắt đầu.'
  return null
}

export function toVoucherRequest(values: VoucherFormValues): VoucherRequest {
  const percentage = values.discountType === 'PERCENTAGE'
  return {
    code: values.code.trim().toUpperCase(),
    branchId: values.branchId,
    discountType: values.discountType,
    discountValue: Number(values.discountValue),
    // The cap only means something for a percentage discount.
    maxDiscountAmount: percentage && values.maxDiscountAmount ? Number(values.maxDiscountAmount) : null,
    minOrderAmount: values.minOrderAmount ? Number(values.minOrderAmount) : 0,
    startDate: new Date(values.startDate).toISOString(),
    endDate: new Date(values.endDate).toISOString(),
    usageLimit: Number(values.usageLimit),
    status: values.active ? 'ACTIVE' : 'EXPIRED',
  }
}
