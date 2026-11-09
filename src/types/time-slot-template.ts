/** TemplateSlot of facility-service. Times are "HH:mm". Day numbers: 0 = Sunday .. 6 = Saturday. */
export interface TimeSlotTemplate {
  id: number
  courtId: number
  dayOfWeek: number
  startTime: string
  endTime: string
  price: number
  active: boolean
}

/** SingleTemplateRequest: one 30-minute slot on one day. */
export interface CreateTimeSlotTemplateRequest {
  dayOfWeek: number
  startTime: string
  endTime: string
  price: number
}

/** UpdateTemplateRequest (PUT /admin/time-slot-templates/{id}); a null or missing field keeps its value. */
export interface UpdateTimeSlotTemplateRequest {
  dayOfWeek?: number | null
  startTime?: string | null
  endTime?: string | null
  price?: number | null
}

/**
 * ApplyTemplateRequest. Missing start/end = the branch hours, missing daysOfWeek = all days,
 * missing price = defaultPricePerHour x 30/60 x priceMultiplier. Slots are always 30 minutes.
 */
export interface ApplyTimeSlotTemplateRequest {
  startTime?: string
  endTime?: string
  price?: number
  priceMultiplier?: number
  daysOfWeek?: number[]
}

export interface PreviewSlot {
  startTime: string
  endTime: string
  price: number
}

export interface TemplatePreviewResponse {
  courtId: number
  slots: PreviewSlot[]
  totalSlots: number
}

export interface ApplyTimeSlotTemplateResponse {
  courtId: number
  daysOfWeek: number[]
  totalSlots: number
  slots: TimeSlotTemplate[]
}

export interface BulkApplyTemplateRequest {
  courtIds: number[]
  template: ApplyTimeSlotTemplateRequest
}

export interface BulkPreviewCourt {
  courtId: number
  courtName: string
  branchId: number
  daysOfWeek: number[]
  slots: PreviewSlot[]
  totalSlots: number
  /** null when the court can take the template, otherwise the reason. */
  conflict: string | null
}

export interface BulkPreviewResponse {
  courts: BulkPreviewCourt[]
  totalSlots: number
  hasConflicts: boolean
}

export interface BulkAppliedCourt {
  courtId: number
  courtName: string
  daysOfWeek: number[]
  slotsPerDay: number
  totalSlots: number
}

export interface BulkApplyResponse {
  courts: BulkAppliedCourt[]
  totalSlots: number
}

/** The backend allows at most this many courts in one bulk request. */
export const MAX_BULK_COURTS = 50

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: 'Chủ nhật',
  1: 'Thứ hai',
  2: 'Thứ ba',
  3: 'Thứ tư',
  4: 'Thứ năm',
  5: 'Thứ sáu',
  6: 'Thứ bảy',
}
