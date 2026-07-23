import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { env } from '@/common/config/env'
import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import type { ApiResponse, TokenResponse } from '@/types/auth'
import { tokenStorage } from '@/utils/token'

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let refreshRequest: Promise<TokenResponse> | null = null

export const axiosClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const NO_REFRESH_ENDPOINTS = [
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.register,
  API_ENDPOINTS.auth.registerCustomer,
  API_ENDPOINTS.auth.registerCourtOwner,
  API_ENDPOINTS.auth.refresh,
]

function isAuthEndpoint(url?: string) {
  if (!url) return false
  return NO_REFRESH_ENDPOINTS.some((endpoint) => url.includes(endpoint))
}

async function requestTokenRefresh(refreshToken: string) {
  const response = await axios.post<ApiResponse<TokenResponse>>(
    API_ENDPOINTS.auth.refresh,
    { refreshToken },
    {
      baseURL: env.apiUrl,
      timeout: 10_000,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )

  if (!response.data.data) {
    throw new Error(response.data.message ?? 'Unable to refresh session.')
  }

  return response.data.data
}

function getSharedRefreshRequest(refreshToken: string) {
  refreshRequest ??= requestTokenRefresh(refreshToken).finally(() => {
    refreshRequest = null
  })

  return refreshRequest
}

function redirectToLogin() {
  sessionStorage.setItem(
    'fcourt.auth.redirectMessage',
    'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  )
  tokenStorage.clear()
  window.location.href = '/auth/login'
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined
    const status = error.response?.status

    if (status !== 401 || !originalRequest || isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error)
    }

    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken || originalRequest._retry) {
      redirectToLogin()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const tokens = await getSharedRefreshRequest(refreshToken)
      tokenStorage.setTokens(tokens)
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
      return axiosClient(originalRequest)
    } catch (refreshError) {
      redirectToLogin()
      return Promise.reject(refreshError)
    }
  },
)
