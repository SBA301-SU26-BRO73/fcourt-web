import type {
  Court,
  CourtStatus,
  CreateCourtRequest,
  UpdateCourtRequest,
} from '@/types/court'

export interface CourtFormValues {
  branchId: string
  name: string
  courtTypeId: string
  description: string
  imageUrl: string
  status: CourtStatus
}

export type CourtFormErrors = Partial<Record<keyof CourtFormValues, string>>

export const emptyCourtFormValues: CourtFormValues = {
  branchId: '',
  name: '',
  courtTypeId: '',
  description: '',
  imageUrl: '',
  status: 'ACTIVE',
}

export function courtToFormValues(court: Court): CourtFormValues {
  return {
    branchId: String(court.branchId),
    name: court.name,
    courtTypeId: String(court.courtTypeId),
    description: court.description ?? '',
    imageUrl: court.imageUrl ?? '',
    status: court.status,
  }
}

export function validateCourtForm(values: CourtFormValues): CourtFormErrors {
  const errors: CourtFormErrors = {}
  const branchId = Number(values.branchId)
  const courtTypeId = Number(values.courtTypeId)

  if (!values.branchId || !Number.isInteger(branchId) || branchId <= 0) {
    errors.branchId = 'Branch is required.'
  }
  if (!values.name.trim()) {
    errors.name = 'Court name is required.'
  } else if (values.name.trim().length > 150) {
    errors.name = 'Maximum 150 characters.'
  }
  if (!values.courtTypeId || !Number.isInteger(courtTypeId) || courtTypeId <= 0) {
    errors.courtTypeId = 'Court type is required.'
  }
  if (values.imageUrl.trim()) {
    try {
      const url = new URL(values.imageUrl.trim())
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
    } catch {
      errors.imageUrl = 'Enter a valid HTTP or HTTPS URL.'
    }
  }

  return errors
}

function nullable(value: string) {
  return value.trim() || null
}

export function toCreateCourtPayload(values: CourtFormValues): CreateCourtRequest {
  return {
    branchId: Number(values.branchId),
    name: values.name.trim(),
    courtTypeId: Number(values.courtTypeId),
    description: nullable(values.description),
    imageUrl: nullable(values.imageUrl),
    status: values.status,
  }
}

export function toUpdateCourtPayload(values: CourtFormValues): UpdateCourtRequest {
  return {
    name: values.name.trim(),
    courtTypeId: Number(values.courtTypeId),
    description: values.description.trim(),
    imageUrl: values.imageUrl.trim(),
    status: values.status,
  }
}
