import type {
  Branch,
  CreateBranchRequest,
  UpdateBranchRequest,
} from '@/types/branch'
import { findDistrictForWard } from '@/data/sample-locations'

export interface BranchFormValues {
  name: string
  address: string
  ward: string
  district: string
  city: string
  phone: string
  openTime: string
  closeTime: string
  slotDurationMinutes: string
  bankAccountNumber: string
  bankAccountName: string
  bankName: string
  bankQrImageUrl: string
}

export type BranchFormErrors = Partial<Record<keyof BranchFormValues, string>>

export const emptyBranchFormValues: BranchFormValues = {
  name: '',
  address: '',
  ward: '',
  district: '',
  city: '',
  phone: '',
  openTime: '06:00',
  closeTime: '22:00',
  slotDurationMinutes: '30',
  bankAccountNumber: '',
  bankAccountName: '',
  bankName: '',
  bankQrImageUrl: '',
}

const maxLengths: Partial<Record<keyof BranchFormValues, number>> = {
  name: 150,
  address: 255,
  ward: 100,
  district: 100,
  city: 100,
  phone: 20,
  bankAccountNumber: 50,
  bankAccountName: 150,
  bankName: 100,
}

export function branchToFormValues(branch: Branch): BranchFormValues {
  return {
    name: branch.name,
    address: branch.address,
    ward: branch.ward ?? '',
    district: findDistrictForWard(branch.city, branch.ward ?? '')?.name ?? '',
    city: branch.city,
    phone: branch.phone ?? '',
    openTime: branch.openTime.slice(0, 5),
    closeTime: branch.closeTime.slice(0, 5),
    slotDurationMinutes: String(branch.slotDurationMinutes ?? 30),
    bankAccountNumber: branch.bankAccountNumber ?? '',
    bankAccountName: branch.bankAccountName ?? '',
    bankName: branch.bankName ?? '',
    bankQrImageUrl: branch.bankQrImageUrl ?? '',
  }
}

export function validateBranchForm(values: BranchFormValues): BranchFormErrors {
  const errors: BranchFormErrors = {}

  for (const field of ['name', 'address', 'city', 'district', 'ward'] as const) {
    if (!values[field].trim()) {
      const labels = { name: 'Tên chi nhánh', address: 'Địa chỉ', city: 'Tỉnh/Thành phố', district: 'Quận/Huyện', ward: 'Phường/Xã' }
      errors[field] = `${labels[field]} là bắt buộc.`
    }
  }

  for (const [field, maxLength] of Object.entries(maxLengths) as Array<
    [keyof BranchFormValues, number]
  >) {
    if (values[field].trim().length > maxLength) {
      errors[field] = `Không được vượt quá ${maxLength} ký tự.`
    }
  }

  if (!values.openTime) errors.openTime = 'Giờ mở cửa là bắt buộc.'
  if (!values.closeTime) errors.closeTime = 'Giờ đóng cửa là bắt buộc.'
  if (!['30', '60'].includes(values.slotDurationMinutes)) errors.slotDurationMinutes = 'Chọn 30 hoặc 60 phút.'
  if (values.openTime && values.closeTime && values.openTime >= values.closeTime) {
    errors.closeTime = 'Giờ đóng cửa phải sau giờ mở cửa.'
  }

  return errors
}

function nullable(value: string) {
  return value.trim() || null
}

function toApiTime(value: string) {
  return value.length === 5 ? `${value}:00` : value
}

export function toCreateBranchPayload(
  values: BranchFormValues,
  adminId: number,
): CreateBranchRequest {
  return {
    adminId,
    name: values.name.trim(),
    address: values.address.trim(),
    ward: nullable(values.ward),
    city: values.city.trim(),
    phone: nullable(values.phone),
    openTime: toApiTime(values.openTime),
    closeTime: toApiTime(values.closeTime),
    slotDurationMinutes: Number(values.slotDurationMinutes) as 30 | 60,
    bankAccountNumber: nullable(values.bankAccountNumber),
    bankAccountName: nullable(values.bankAccountName),
    bankName: nullable(values.bankName),
    bankQrImageUrl: nullable(values.bankQrImageUrl),
  }
}

export function toUpdateBranchPayload(
  values: BranchFormValues,
  adminId: number,
): UpdateBranchRequest {
  return { ...toCreateBranchPayload(values, adminId), status: 'ACTIVE' }
}
