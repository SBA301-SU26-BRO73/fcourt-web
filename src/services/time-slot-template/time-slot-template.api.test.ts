import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import {
  applyTimeSlotTemplate,
  bulkApplyTimeSlotTemplate,
  createTimeSlotTemplate,
  deleteTimeSlotTemplate,
  getTimeSlotTemplatesByCourt,
  previewBulkTimeSlotTemplate,
  previewTimeSlotTemplate,
  updateTimeSlotTemplate,
} from './time-slot-template.api'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const http = vi.mocked(axiosClient)

describe('time slot template api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists the templates of a court, optionally for one weekday', async () => {
    http.get.mockResolvedValue({ data: [] })
    await getTimeSlotTemplatesByCourt(7)
    await getTimeSlotTemplatesByCourt(7, 0)
    expect(http.get).toHaveBeenNthCalledWith(1, '/admin/courts/7/time-slot-templates', undefined)
    expect(http.get).toHaveBeenNthCalledWith(2, '/admin/courts/7/time-slot-templates', { params: { dayOfWeek: 0 } })
  })

  it('creates one slot under the court path', async () => {
    const body = { dayOfWeek: 1, startTime: '06:00:00', endTime: '06:30:00', price: 50000 }
    http.post.mockResolvedValue({ data: { id: 1 } })
    await createTimeSlotTemplate(7, body)
    expect(http.post).toHaveBeenCalledWith('/admin/courts/7/time-slot-templates', body)
  })

  it('updates and deletes by template id', async () => {
    http.put.mockResolvedValue({ data: { id: 3 } })
    http.delete.mockResolvedValue({})
    await updateTimeSlotTemplate(3, { price: 60000 })
    await deleteTimeSlotTemplate(3)
    expect(http.put).toHaveBeenCalledWith('/admin/time-slot-templates/3', { price: 60000 })
    expect(http.delete).toHaveBeenCalledWith('/admin/time-slot-templates/3')
  })

  it('previews and applies a template for one court', async () => {
    const body = { startTime: '06:00:00', endTime: '22:00:00', daysOfWeek: [1, 2] }
    http.post.mockResolvedValue({ data: {} })
    await previewTimeSlotTemplate(7, body)
    await applyTimeSlotTemplate(7, body)
    expect(http.post).toHaveBeenNthCalledWith(1, '/admin/courts/7/time-slot-templates/preview', body)
    expect(http.post).toHaveBeenNthCalledWith(2, '/admin/courts/7/apply-template', body)
  })

  it('previews and applies a template to many courts', async () => {
    const body = { courtIds: [1, 2], template: { daysOfWeek: [0] } }
    http.post.mockResolvedValue({ data: {} })
    await previewBulkTimeSlotTemplate(body)
    await bulkApplyTimeSlotTemplate(body)
    expect(http.post).toHaveBeenNthCalledWith(1, '/admin/courts/bulk-apply-template/preview', body)
    expect(http.post).toHaveBeenNthCalledWith(2, '/admin/courts/bulk-apply-template', body)
  })
})
