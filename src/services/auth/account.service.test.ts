import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'

import { forgotPassword, googleLogin, removeAvatar, resetPassword, uploadAvatar } from './auth.service'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const client = vi.mocked(axiosClient)

describe('account service (forgot, reset, google, avatar)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('requests a password reset and returns the generic message', async () => {
    client.post.mockResolvedValue({ data: { message: 'sent' } })
    await expect(forgotPassword('a@b.com')).resolves.toBe('sent')
    expect(client.post).toHaveBeenCalledWith('/auth/password/forgot', { email: 'a@b.com' })
  })

  it('resets the password with the emailed token', async () => {
    client.post.mockResolvedValue({ data: { message: 'ok' } })
    await resetPassword('tok', 'newpassword1')
    expect(client.post).toHaveBeenCalledWith('/auth/password/reset', { token: 'tok', newPassword: 'newpassword1' })
  })

  it('sends the Google ID token as idToken', async () => {
    const tokens = { accessToken: 'a', refreshToken: 'r', expiresIn: 900 }
    client.post.mockResolvedValue({ data: tokens })
    await expect(googleLogin('google-jwt')).resolves.toBe(tokens)
    expect(client.post).toHaveBeenCalledWith('/auth/google', { idToken: 'google-jwt' })
  })

  it('uploads the avatar as multipart part "file"', async () => {
    client.put.mockResolvedValue({ data: { id: 1, avatarUrl: 'https://cdn/x.png' } })
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    const profile = await uploadAvatar(file)
    const [url, body] = client.put.mock.calls[0]
    expect(url).toBe('/auth/profile/avatar')
    expect((body as FormData).get('file')).toBe(file)
    expect(profile.avatarUrl).toBe('https://cdn/x.png')
  })

  it('clears the avatar', async () => {
    client.delete.mockResolvedValue({ data: { id: 1, avatarUrl: null } })
    await expect(removeAvatar()).resolves.toMatchObject({ avatarUrl: null })
    expect(client.delete).toHaveBeenCalledWith('/auth/profile/avatar')
  })
})
