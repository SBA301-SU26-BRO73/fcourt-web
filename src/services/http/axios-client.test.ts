import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/common/utils/api-error'
import type { TokenResponse } from '@/types/auth'
import { tokenStorage } from '@/utils/token'

import { axiosClient } from './axios-client'

const storageMocks = vi.hoisted(() => ({
  clear: vi.fn(),
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  setTokens: vi.fn(),
}))

vi.mock('@/common/config/env', () => ({
  env: {
    apiUrl: 'http://api.test',
  },
}))

vi.mock('@/utils/token', () => ({
  tokenStorage: storageMocks,
}))

const mockedStorage = vi.mocked(tokenStorage)

function response<T>(config: InternalAxiosRequestConfig, data: T): AxiosResponse<T> {
  return {
    config,
    data,
    headers: {},
    status: 200,
    statusText: 'OK',
  }
}

function unauthorized(config: InternalAxiosRequestConfig) {
  return {
    config,
    isAxiosError: true,
    response: {
      config,
      data: {},
      headers: {},
      status: 401,
      statusText: 'Unauthorized',
    },
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, reject, resolve }
}

function flushInterceptors() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

function setLocationHref() {
  let href = 'http://localhost/current'
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      get href() {
        return href
      },
      set href(value: string) {
        href = value
      },
    },
  })
}

describe('axiosClient interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
    setLocationHref()
    mockedStorage.getAccessToken.mockReturnValue(null)
    mockedStorage.getRefreshToken.mockReturnValue(null)
  })

  it('adds bearer authorization from token storage', async () => {
    mockedStorage.getAccessToken.mockReturnValue('access-token')
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) =>
      response(config, { ok: true }),
    )
    axiosClient.defaults.adapter = adapter

    await axiosClient.get('/branches')

    expect(adapter).toHaveBeenCalledTimes(1)
    expect(adapter.mock.calls[0][0].headers.Authorization).toBe('Bearer access-token')
  })

  it('refreshes once and retries the original request with new access token', async () => {
    const tokens: TokenResponse = {
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      expiresIn: 900,
    }
    mockedStorage.getRefreshToken.mockReturnValue('refresh-token')
    const refreshPost = vi.spyOn(axios, 'post').mockResolvedValue({ data: tokens })
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      if (!('_retry' in config)) {
        return Promise.reject(unauthorized(config))
      }
      return response(config, { ok: true })
    })
    axiosClient.defaults.adapter = adapter

    const result = await axiosClient.get('/protected')

    expect(refreshPost).toHaveBeenCalledTimes(1)
    expect(refreshPost).toHaveBeenCalledWith(
      '/auth/refresh',
      { refreshToken: 'refresh-token' },
      {
        baseURL: 'http://api.test',
        timeout: 10_000,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    expect(mockedStorage.setTokens).toHaveBeenCalledWith(tokens)
    expect(adapter).toHaveBeenCalledTimes(2)
    expect(adapter.mock.calls[1][0].headers.Authorization).toBe('Bearer new-access')
    expect(result.data).toEqual({ ok: true })
  })

  it('deduplicates refresh calls for concurrent 401 responses', async () => {
    const tokens: TokenResponse = {
      accessToken: 'shared-access',
      refreshToken: 'shared-refresh',
      expiresIn: 900,
    }
    const refresh = deferred<AxiosResponse<TokenResponse>>()
    mockedStorage.getRefreshToken.mockReturnValue('refresh-token')
    const refreshPost = vi.spyOn(axios, 'post').mockReturnValue(refresh.promise)
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      if (!('_retry' in config)) {
        return Promise.reject(unauthorized(config))
      }
      return response(config, { url: config.url })
    })
    axiosClient.defaults.adapter = adapter

    const requests = [
      axiosClient.get('/protected/a'),
      axiosClient.get('/protected/b'),
      axiosClient.get('/protected/c'),
    ]
    await flushInterceptors()

    expect(refreshPost).toHaveBeenCalledTimes(1)

    refresh.resolve(response({} as InternalAxiosRequestConfig, tokens))

    const results = await Promise.all(requests)

    expect(results.map((result) => result.data)).toEqual([
      { url: '/protected/a' },
      { url: '/protected/b' },
      { url: '/protected/c' },
    ])
    expect(mockedStorage.setTokens).toHaveBeenCalledTimes(1)
    expect(adapter).toHaveBeenCalledTimes(6)
  })

  it('clears session and redirects when refresh fails', async () => {
    mockedStorage.getRefreshToken.mockReturnValue('refresh-token')
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('Refresh failed'))
    axiosClient.defaults.adapter = vi.fn(async (config: InternalAxiosRequestConfig) =>
      Promise.reject(unauthorized(config)),
    )

    await expect(axiosClient.get('/protected')).rejects.toThrow('Refresh failed')

    expect(mockedStorage.clear).toHaveBeenCalledTimes(1)
    expect(window.location.href).toBe('/auth/login')
  })

  it('clears session and redirects when 401 has no refresh token', async () => {
    axiosClient.defaults.adapter = vi.fn(async (config: InternalAxiosRequestConfig) =>
      Promise.reject(unauthorized(config)),
    )

    await expect(axiosClient.get('/protected')).rejects.toBeInstanceOf(ApiError)

    expect(mockedStorage.clear).toHaveBeenCalledTimes(1)
    expect(window.location.href).toBe('/auth/login')
  })
})
