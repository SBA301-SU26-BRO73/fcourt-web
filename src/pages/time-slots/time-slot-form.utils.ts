import type {
  CreateTimeSlotTemplateRequest,
  TimeSlotTemplate,
  UpdateTimeSlotTemplateRequest,
} from '@/types/time-slot-template'

export interface TimeSlotFormValues {
  courtId: string
  dayOfWeek: string
  startTime: string
  endTime: string
  price: string
  active: boolean
}

export type TimeSlotFormErrors = Partial<Record<keyof TimeSlotFormValues, string>>

export const emptyTimeSlotFormValues: TimeSlotFormValues = {
  courtId: '',
  dayOfWeek: '1',
  startTime: '06:00',
  endTime: '07:00',
  price: '',
  active: true,
}

export function timeSlotToFormValues(slot: TimeSlotTemplate): TimeSlotFormValues {
  return {
    courtId: String(slot.courtId),
    dayOfWeek: String(slot.dayOfWeek),
    startTime: slot.startTime.slice(0, 5),
    endTime: slot.endTime.slice(0, 5),
    price: String(slot.price),
    active: slot.active,
  }
}

export function validateTimeSlotForm(values: TimeSlotFormValues): TimeSlotFormErrors {
  const errors: TimeSlotFormErrors = {}
  const courtId = Number(values.courtId)
  const dayOfWeek = Number(values.dayOfWeek)
  const price = Number(values.price)

  if (!Number.isInteger(courtId) || courtId <= 0) errors.courtId = 'Court là bắt buộc.'
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    errors.dayOfWeek = 'Ngày trong tuần không hợp lệ.'
  }
  if (!values.startTime) errors.startTime = 'Giờ bắt đầu là bắt buộc.'
  if (!values.endTime) errors.endTime = 'Giờ kết thúc là bắt buộc.'
  if (values.startTime && values.endTime && values.startTime >= values.endTime) {
    errors.endTime = 'Giờ kết thúc phải sau giờ bắt đầu.'
  }
  if (!values.price.trim()) {
    errors.price = 'Giá là bắt buộc.'
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.price = 'Giá phải lớn hơn 0.'
  } else if (!/^\d+(\.\d{1,2})?$/.test(values.price.trim())) {
    errors.price = 'Giá chỉ được có tối đa 2 chữ số thập phân.'
  } else if (price > 99_999_999.99) {
    errors.price = 'Giá vượt quá giới hạn lưu trữ.'
  }
  return errors
}

function toApiTime(value: string) {
  return value.length === 5 ? `${value}:00` : value
}

export function toCreateTimeSlotPayload(
  values: TimeSlotFormValues,
): CreateTimeSlotTemplateRequest {
  return {
    courtId: Number(values.courtId),
    dayOfWeek: Number(values.dayOfWeek),
    startTime: toApiTime(values.startTime),
    endTime: toApiTime(values.endTime),
    price: Number(values.price),
    active: values.active,
  }
}

export function toUpdateTimeSlotPayload(
  values: TimeSlotFormValues,
): UpdateTimeSlotTemplateRequest {
  return {
    dayOfWeek: Number(values.dayOfWeek),
    startTime: toApiTime(values.startTime),
    endTime: toApiTime(values.endTime),
    price: Number(values.price),
    active: values.active,
  }
}
