import type {
  ApplyTimeSlotTemplateRequest,
  CreateTimeSlotTemplateRequest,
  TimeSlotTemplate,
  UpdateTimeSlotTemplateRequest,
} from '@/types/time-slot-template'

/** Every template slot lasts exactly this long (facility-service `SlotTemplateEngine.SLOT_MINUTES`). */
export const TEMPLATE_SLOT_MINUTES = 30

/** `range`: generate 30-minute slots over a time range (replaces the chosen days). `single`: one slot. */
export type TimeSlotFormMode = 'range' | 'single'

export interface TimeSlotFormValues {
  courtId: string
  mode: TimeSlotFormMode
  dayOfWeeks: string[]
  startTime: string
  endTime: string
  price: string
}

export type TimeSlotFormErrors = Partial<Record<keyof TimeSlotFormValues, string>>

export const emptyTimeSlotFormValues: TimeSlotFormValues = {
  courtId: '',
  mode: 'range',
  dayOfWeeks: ['1'],
  startTime: '06:00',
  endTime: '22:00',
  price: '',
}

export function timeSlotToFormValues(slot: TimeSlotTemplate): TimeSlotFormValues {
  return {
    courtId: String(slot.courtId),
    mode: 'single',
    dayOfWeeks: [String(slot.dayOfWeek)],
    startTime: slot.startTime.slice(0, 5),
    endTime: slot.endTime.slice(0, 5),
    price: String(slot.price),
  }
}

function toMinutes(value: string) {
  const [hour = '0', minute = '0'] = value.split(':')
  return Number(hour) * 60 + Number(minute)
}

function toApiTime(value: string) {
  return value.length === 5 ? `${value}:00` : value
}

function validatePrice(raw: string, required: boolean) {
  const value = raw.trim()
  if (!value) return required ? 'Giá là bắt buộc.' : undefined
  const price = Number(value)
  if (!Number.isFinite(price) || price <= 0) return 'Giá phải lớn hơn 0.'
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return 'Giá chỉ được có tối đa 2 chữ số thập phân.'
  if (price > 99_999_999.99) return 'Giá vượt quá giới hạn lưu trữ.'
  return undefined
}

/**
 * `isEdit` always edits one 30-minute slot. In `range` mode the price may stay empty:
 * the backend then uses the default price of the court.
 */
export function validateTimeSlotForm(values: TimeSlotFormValues, isEdit = false): TimeSlotFormErrors {
  const errors: TimeSlotFormErrors = {}
  const single = isEdit || values.mode === 'single'
  const courtId = Number(values.courtId)
  const days = values.dayOfWeeks.map(Number)

  if (!Number.isInteger(courtId) || courtId <= 0) errors.courtId = 'Court là bắt buộc.'
  if (days.length === 0 || days.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) {
    errors.dayOfWeeks = 'Chọn ít nhất một ngày hợp lệ.'
  }
  if (!values.startTime) errors.startTime = 'Giờ bắt đầu là bắt buộc.'
  if (!values.endTime) errors.endTime = 'Giờ kết thúc là bắt buộc.'
  if (values.startTime && values.endTime) {
    const range = toMinutes(values.endTime) - toMinutes(values.startTime)
    if (range <= 0) errors.endTime = 'Giờ kết thúc phải sau giờ bắt đầu.'
    else if (single && range !== TEMPLATE_SLOT_MINUTES) {
      errors.endTime = `Một khung giờ mẫu dài đúng ${TEMPLATE_SLOT_MINUTES} phút.`
    } else if (range % TEMPLATE_SLOT_MINUTES !== 0) {
      errors.endTime = `Khoảng giờ phải chia hết cho ${TEMPLATE_SLOT_MINUTES} phút.`
    }
    if (toMinutes(values.startTime) % TEMPLATE_SLOT_MINUTES !== 0) {
      errors.startTime = 'Giờ bắt đầu phải tròn 00 hoặc 30 phút.'
    }
  }
  const priceError = validatePrice(values.price, single)
  if (priceError) errors.price = priceError
  return errors
}

export function toApplyPayload(values: TimeSlotFormValues): ApplyTimeSlotTemplateRequest {
  const price = values.price.trim()
  return {
    startTime: toApiTime(values.startTime),
    endTime: toApiTime(values.endTime),
    daysOfWeek: values.dayOfWeeks.map(Number).sort((a, b) => a - b),
    ...(price ? { price: Number(price) } : {}),
  }
}

export function toCreateTimeSlotPayload(values: TimeSlotFormValues, dayOfWeek: number): CreateTimeSlotTemplateRequest {
  return {
    dayOfWeek,
    startTime: toApiTime(values.startTime),
    endTime: toApiTime(values.endTime),
    price: Number(values.price),
  }
}

export function toUpdateTimeSlotPayload(values: TimeSlotFormValues): UpdateTimeSlotTemplateRequest {
  return {
    dayOfWeek: Number(values.dayOfWeeks[0]),
    startTime: toApiTime(values.startTime),
    endTime: toApiTime(values.endTime),
    price: Number(values.price),
  }
}
