import { beforeEach, describe, expect, it, vi } from 'vitest'

import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'

import {
  getProfile,
  login,
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
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 123,
      },
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
    const data = { data: { accessToken: 'access', refreshToken: 'refresh', expiresIn: 1 } }
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
    const data = { data: undefined }
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
    const data = { data: { accessToken: 'new-access', refreshToken: 'new-refresh', expiresIn: 2 } }
    mockedAxiosClient.post.mockResolvedValueOnce({ data })

    await expect(refreshToken('refresh-token')).resolves.toBe(data)

    expect(mockedAxiosClient.post).toHaveBeenCalledWith(API_ENDPOINTS.auth.refresh, {
      refreshToken: 'refresh-token',
    })
  })

  it('loads and updates profile through auth endpoints', async () => {
    const profile = {
      data: {
        id: 1,
        email: 'user@example.com',
        role: 'CUSTOMER',
        fullName: 'User',
        phone: '0912345678',
        status: 'ACTIVE',
      },
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
})
