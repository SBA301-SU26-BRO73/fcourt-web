import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { BranchGallery } from './branch-gallery'

const saved = [{ id: 1, branchId: 7, url: 'https://cdn/1.jpg', sortOrder: 0, createdAt: '' }]

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview')
  URL.revokeObjectURL = vi.fn()
})

afterEach(cleanup)

describe('BranchGallery', () => {
  it('shows the empty state and the counter', () => {
    render(<BranchGallery existing={[]} staged={[]} onAddFiles={vi.fn()} onRemoveStaged={vi.fn()} onDeleteExisting={vi.fn()} />)
    expect(screen.getByText('Chưa có ảnh nào.')).toBeTruthy()
    expect(screen.getByText(/\(0\/10\)/)).toBeTruthy()
  })

  it('deletes a saved image and removes a staged one', () => {
    const onDeleteExisting = vi.fn()
    const onRemoveStaged = vi.fn()
    const file = new File(['x'], 'new.png', { type: 'image/png' })
    render(<BranchGallery existing={saved} staged={[file]} onAddFiles={vi.fn()} onRemoveStaged={onRemoveStaged} onDeleteExisting={onDeleteExisting} />)
    fireEvent.click(screen.getByLabelText('Xóa ảnh'))
    expect(onDeleteExisting).toHaveBeenCalledWith(saved[0])
    fireEvent.click(screen.getByLabelText('Bỏ ảnh new.png'))
    expect(onRemoveStaged).toHaveBeenCalledWith(0)
  })

  it('hands picked files to the parent', () => {
    const onAddFiles = vi.fn()
    const { container } = render(<BranchGallery existing={[]} staged={[]} onAddFiles={onAddFiles} onRemoveStaged={vi.fn()} onDeleteExisting={vi.fn()} />)
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [file] } })
    expect(onAddFiles).toHaveBeenCalledWith([file])
  })

  it('shows an error message', () => {
    render(<BranchGallery existing={[]} staged={[]} error="Tối đa 10 ảnh" onAddFiles={vi.fn()} onRemoveStaged={vi.fn()} onDeleteExisting={vi.fn()} />)
    expect(screen.getByRole('alert').textContent).toBe('Tối đa 10 ảnh')
  })
})
