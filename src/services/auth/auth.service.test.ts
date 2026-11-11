import { beforeEach, describe, expect, it, vi } from 'vitest'

import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'

import {
  getProfile,
  login,
  logout,
  refreshToken,
  registerCourtOwner,
  registerCustomer,
  updateProfile,
} from './auth.service'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}))

const mockedAxiosClient = vi.mocked(axiosClient)

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('posts login credentials and returns response data', async () => {
    const data = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 900,
    }
    mockedAxiosClient.post.mockResolvedValueOnce({ data })

    await expect(login({ email: 'user@example.com', password: 'secret' })).resolves.toBe(data)

    expect(mockedAxiosClient.post).toHaveBeenCalledWith(API_ENDPOINTS.auth.login, {
      email: 'user@example.com',
      password: 'secret',
    })
  })

  it('surfaces login request failures to callers', async () => {
    const error = new Error('Email hoặc mật khẩu không đúng')
    mockedAxiosClient.post.mockRejectedValueOnce(error)

    await expect(login({ email: 'user@example.com', password: 'bad' })).rejects.toThrow(
      'Email hoặc mật khẩu không đúng',
    )
  })

  it('posts customer registration data', async () => {
    const data = { accessToken: 'access', refreshToken: 'refresh', expiresIn: 900 }
    const request = {
      fullName: 'Customer',
      email: 'customer@example.com',
      phone: '0912345678',
      password: 'secret',
    }
    mockedAxiosClient.post.mockResolvedValueOnce({ data })

    await expect(registerCustomer(request)).resolves.toBe(data)

    expect(mockedAxiosClient.post).toHaveBeenCalledWith(API_ENDPOINTS.auth.registerCustomer, request)
  })

  it('posts court owner form data with multipart headers', async () => {
    const formData = new FormData()
    formData.append('email', 'owner@example.com')
    const data = { id: 1, status: 'PENDING_APPROVAL', message: 'ok' }
    mockedAxiosClient.post.mockResolvedValueOnce({ data })

    await expect(registerCourtOwner(formData)).resolves.toBe(data)

    expect(mockedAxiosClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.auth.registerCourtOwner,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    )
  })

  it('posts refresh token payload', async () => {
    const data = { accessToken: 'new-access', refreshToken: 'new-refresh', expiresIn: 900 }
    mockedAxiosClient.post.mockResolvedValueOnce({ data })

    await expect(refreshToken('refresh-token')).resolves.toBe(data)

    expect(mockedAxiosClient.post).toHaveBeenCalledWith(API_ENDPOINTS.auth.refresh, {
      refreshToken: 'refresh-token',
    })
  })

  it('loads and updates profile through auth endpoints', async () => {
    const profile = {
      id: 1,
      email: 'user@example.com',
      role: 'CUSTOMER',
      fullName: 'User',
      phone: '0912345678',
      status: 'ACTIVE',
    }
    mockedAxiosClient.get.mockResolvedValueOnce({ data: profile })
    mockedAxiosClient.patch.mockResolvedValueOnce({ data: profile })

    await expect(getProfile()).resolves.toBe(profile)
    await expect(updateProfile({ fullName: 'User', phone: '0912345678' })).resolves.toBe(profile)

    expect(mockedAxiosClient.get).toHaveBeenCalledWith(API_ENDPOINTS.auth.profile)
    expect(mockedAxiosClient.patch).toHaveBeenCalledWith(API_ENDPOINTS.auth.profile, {
      fullName: 'User',
      phone: '0912345678',
    })
  })

  it('posts the refresh token to logout', async () => {
    mockedAxiosClient.post.mockResolvedValueOnce({ status: 204 })

    await expect(logout('refresh-token')).resolves.toBeUndefined()

    expect(mockedAxiosClient.post).toHaveBeenCalledWith(API_ENDPOINTS.auth.logout, {
      refreshToken: 'refresh-token',
    })
  })
})
