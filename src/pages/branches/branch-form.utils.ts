import type {
  Branch,
  CreateBranchRequest,
  UpdateBranchRequest,
} from '@/types/branch'

export interface BranchFormValues {
  name: string
  address: string
  ward: string
  city: string
  phone: string
  openTime: string
  closeTime: string
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
  city: '',
  phone: '',
  openTime: '06:00',
  closeTime: '22:00',
  bankAccountNumber: '',
  bankAccountName: '',
  bankName: '',
  bankQrImageUrl: '',
}

const maxLengths: Partial<Record<keyof BranchFormValues, number>> = {
  name: 150,
  address: 255,
  ward: 100,
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
    city: branch.city,
    phone: branch.phone ?? '',
    openTime: branch.openTime.slice(0, 5),
    closeTime: branch.closeTime.slice(0, 5),
    bankAccountNumber: branch.bankAccountNumber ?? '',
    bankAccountName: branch.bankAccountName ?? '',
    bankName: branch.bankName ?? '',
    bankQrImageUrl: branch.bankQrImageUrl ?? '',
  }
}

export function validateBranchForm(values: BranchFormValues): BranchFormErrors {
  const errors: BranchFormErrors = {}

  for (const field of ['name', 'address', 'city'] as const) {
    if (!values[field].trim()) {
      errors[field] = `${field[0].toUpperCase()}${field.slice(1)} is required.`
    }
  }

  for (const [field, maxLength] of Object.entries(maxLengths) as Array<
    [keyof BranchFormValues, number]
  >) {
    if (values[field].trim().length > maxLength) {
      errors[field] = `Maximum ${maxLength} characters.`
    }
  }

  if (!values.openTime) errors.openTime = 'Open time is required.'
  if (!values.closeTime) errors.closeTime = 'Close time is required.'
  if (values.openTime && values.closeTime && values.openTime >= values.closeTime) {
    errors.closeTime = 'Close time must be later than open time.'
  }

  if (values.bankQrImageUrl.trim()) {
    try {
      const url = new URL(values.bankQrImageUrl.trim())
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    } catch {
      errors.bankQrImageUrl = 'Enter a valid HTTP or HTTPS URL.'
    }
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
