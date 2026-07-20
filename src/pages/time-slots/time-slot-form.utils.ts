import type {
  CreateTimeSlotTemplateRequest,
  TimeSlotTemplate,
  UpdateTimeSlotTemplateRequest,
} from '@/types/time-slot-template'

export interface TimeSlotFormValues {
  courtId: string
  dayOfWeeks: string[]
  startTime: string
  endTime: string
  price: string
  slotDurationMinutes: string
  active: boolean
}

export type TimeSlotFormErrors = Partial<Record<keyof TimeSlotFormValues, string>>

export const emptyTimeSlotFormValues: TimeSlotFormValues = {
  courtId: '',
  dayOfWeeks: ['1'],
  startTime: '06:00',
  endTime: '07:00',
  price: '',
  slotDurationMinutes: '60',
  active: true,
}

export function timeSlotToFormValues(slot: TimeSlotTemplate): TimeSlotFormValues {
  return {
    courtId: String(slot.courtId),
    dayOfWeeks: [String(slot.dayOfWeek)],
    startTime: slot.startTime.slice(0, 5),
    endTime: slot.endTime.slice(0, 5),
    price: String(slot.price),
    slotDurationMinutes: String(Math.max(30, Math.min(60, toMinutes(slot.endTime) - toMinutes(slot.startTime)))),
    active: slot.active,
  }
}

export function validateTimeSlotForm(values: TimeSlotFormValues): TimeSlotFormErrors {
  const errors: TimeSlotFormErrors = {}
  const courtId = Number(values.courtId)
  const dayOfWeeks = values.dayOfWeeks.map(Number)
  const price = Number(values.price)

  if (!Number.isInteger(courtId) || courtId <= 0) errors.courtId = 'Court là bắt buộc.'
  if (dayOfWeeks.length === 0 || dayOfWeeks.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) {
    errors.dayOfWeeks = 'Chọn ít nhất một ngày hợp lệ.'
  }
  const duration = Number(values.slotDurationMinutes)
  if (duration !== 30 && duration !== 60) errors.slotDurationMinutes = 'Độ dài slot phải là 30 hoặc 60 phút.'
  if (values.startTime && values.endTime && duration > 0) {
    const range = toMinutes(values.endTime) - toMinutes(values.startTime)
    if (range > 0 && range % duration !== 0) errors.slotDurationMinutes = 'Khoảng giờ phải chia hết cho độ dài slot.'
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
    dayOfWeeks: values.dayOfWeeks.map(Number),
    startTime: toApiTime(values.startTime),
    endTime: toApiTime(values.endTime),
    price: Number(values.price),
    active: values.active,
  }
}

function toMinutes(value: string) {
  const [hour = '0', minute = '0'] = value.split(':')
  return Number(hour) * 60 + Number(minute)
}

export function toUpdateTimeSlotPayload(
  values: TimeSlotFormValues,
): UpdateTimeSlotTemplateRequest {
  return {
    dayOfWeek: Number(values.dayOfWeeks[0]),
    startTime: toApiTime(values.startTime),
    endTime: toApiTime(values.endTime),
    price: Number(values.price),
    active: values.active,
  }
}
