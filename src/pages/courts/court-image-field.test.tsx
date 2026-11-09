import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { validateCourtImageFile } from './court-form.utils'
import { CourtImageField } from './court-image-field'

const handlers = () => ({
  onSelect: vi.fn(),
  onClearSelection: vi.fn(),
  onRemoveCurrent: vi.fn(),
  onUndoRemove: vi.fn(),
})

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview')
  URL.revokeObjectURL = vi.fn()
})
afterEach(cleanup)

describe('CourtImageField', () => {
  it('shows the current image and offers to replace or remove it', () => {
    const h = handlers()
    render(<CourtImageField currentUrl="https://cdn/court.jpg" file={null} removed={false} {...h} />)
    expect(screen.getByRole('img', { name: 'Ảnh sân' }).getAttribute('src')).toBe('https://cdn/court.jpg')
    expect(screen.getByText('Đổi ảnh')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Xóa ảnh/ }))
    expect(h.onRemoveCurrent).toHaveBeenCalled()
  })

  it('offers an upload when there is no image and reports the picked file', () => {
    const h = handlers()
    const { container } = render(<CourtImageField currentUrl="" file={null} removed={false} {...h} />)
    expect(screen.getByText('Chưa có ảnh')).toBeTruthy()
    expect(screen.getByText('Tải ảnh lên')).toBeTruthy()
    const file = new File([new Uint8Array([1])], 'a.png', { type: 'image/png' })
    fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, { target: { files: [file] } })
    expect(h.onSelect).toHaveBeenCalledWith(file)
  })

  it('previews a picked file instead of the saved image and can drop it', () => {
    const h = handlers()
    const file = new File([new Uint8Array([1])], 'a.png', { type: 'image/png' })
    render(<CourtImageField currentUrl="https://cdn/court.jpg" file={file} removed={false} {...h} />)
    expect(screen.getByRole('img', { name: 'Ảnh sân' }).getAttribute('src')).toBe('blob:preview')
    fireEvent.click(screen.getByRole('button', { name: /Bỏ ảnh vừa chọn/ }))
    expect(h.onClearSelection).toHaveBeenCalled()
  })

  it('shows the removal notice and lets the owner undo it', () => {
    const h = handlers()
    render(<CourtImageField currentUrl="https://cdn/court.jpg" file={null} removed {...h} />)
    expect(screen.getByText('Ảnh sẽ bị xóa khi lưu')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Giữ lại ảnh cũ/ }))
    expect(h.onUndoRemove).toHaveBeenCalled()
  })

  it('shows a validation error', () => {
    render(<CourtImageField currentUrl="" file={null} removed={false} error="Chỉ nhận ảnh" {...handlers()} />)
    expect(screen.getByRole('alert').textContent).toBe('Chỉ nhận ảnh')
  })
})

describe('validateCourtImageFile', () => {
  it('accepts JPEG/PNG/WebP up to 5 MB and rejects the rest', () => {
    expect(validateCourtImageFile(new File([''], 'a.webp', { type: 'image/webp' }))).toBeNull()
    expect(validateCourtImageFile(new File([''], 'a.gif', { type: 'image/gif' }))).toMatch(/JPEG, PNG/)
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'a.png', { type: 'image/png' })
    expect(validateCourtImageFile(big)).toMatch(/5 MB/)
  })
})
