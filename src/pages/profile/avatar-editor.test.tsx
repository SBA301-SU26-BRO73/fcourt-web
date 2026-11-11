import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { removeAvatar, uploadAvatar } from '@/services/auth/auth.service'

import { AvatarEditor } from './avatar-editor'
import { validateAvatarFile } from './avatar.utils'

vi.mock('@/services/auth/auth.service', () => ({ uploadAvatar: vi.fn(), removeAvatar: vi.fn() }))

describe('validateAvatarFile', () => {
  it('accepts images up to 2 MB only', () => {
    expect(validateAvatarFile({ type: 'image/png', size: 1000 })).toBeNull()
    expect(validateAvatarFile({ type: 'application/pdf', size: 1000 })).toBeTruthy()
    expect(validateAvatarFile({ type: 'image/png', size: 2 * 1024 * 1024 + 1 })).toBeTruthy()
  })
})

describe('AvatarEditor', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('uploads a picked image and reports the new profile', async () => {
    const profile = { id: 1, avatarUrl: 'https://cdn/new.png' }
    vi.mocked(uploadAvatar).mockResolvedValue(profile as never)
    const onChanged = vi.fn()
    render(<AvatarEditor avatarUrl={null} initials="NA" onChanged={onChanged} />)
    expect(screen.getByText('NA')).toBeTruthy()
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('Chọn ảnh đại diện'), { target: { files: [file] } })
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith(profile, expect.any(String)))
    expect(uploadAvatar).toHaveBeenCalledWith(file)
  })

  it('rejects a non-image without calling the API', () => {
    render(<AvatarEditor avatarUrl={null} initials="NA" onChanged={vi.fn()} />)
    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText('Chọn ảnh đại diện'), { target: { files: [file] } })
    expect(screen.getByRole('alert').textContent).toContain('ảnh')
    expect(uploadAvatar).not.toHaveBeenCalled()
  })

  it('removes the current avatar', async () => {
    const profile = { id: 1, avatarUrl: null }
    vi.mocked(removeAvatar).mockResolvedValue(profile as never)
    const onChanged = vi.fn()
    render(<AvatarEditor avatarUrl="https://cdn/old.png" initials="NA" onChanged={onChanged} />)
    fireEvent.click(screen.getByLabelText('Xóa ảnh đại diện'))
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith(profile, expect.any(String)))
  })
})
