import axios, { isAxiosError, type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { env } from '@/common/config/env'
import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { toApiError } from '@/common/utils/api-error'
import type { TokenResponse } from '@/types/auth'
import { tokenStorage } from '@/utils/token'

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

/** Single-flight: every concurrent 401 waits on the same refresh call. */
let refreshRequest: Promise<TokenResponse> | null = null

export const axiosClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** Marker header: the request is a capability call (e.g. a hold token) and must not carry the session. */
export const SKIP_AUTH_HEADER = 'X-Skip-Auth'

axiosClient.interceptors.request.use((config) => {
  if (config.headers?.[SKIP_AUTH_HEADER]) {
    config.headers.delete(SKIP_AUTH_HEADER)
    return config
  }
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const NO_REFRESH_ENDPOINTS = [
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.registerCustomer,
  API_ENDPOINTS.auth.registerCourtOwner,
  API_ENDPOINTS.auth.refresh,
  API_ENDPOINTS.auth.logout,
  API_ENDPOINTS.auth.forgotPassword,
  API_ENDPOINTS.auth.resetPassword,
  API_ENDPOINTS.auth.google,
]

function isAuthEndpoint(url?: string) {
  if (!url) return false
  return NO_REFRESH_ENDPOINTS.some((endpoint) => url.includes(endpoint))
}

/** The refresh call goes through bare axios so it cannot trigger this interceptor. */
async function requestTokenRefresh(refreshToken: string): Promise<TokenResponse> {
  const response = await axios.post<TokenResponse>(
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

  if (!response.data?.accessToken) {
    throw new Error('Unable to refresh session.')
  }

  return {
    ...response.data,
    // The refresh token rotates; keep the old one only if the server omits a new one.
    refreshToken: response.data.refreshToken || refreshToken,
  }
}

function getSharedRefreshRequest(refreshToken: string) {
  refreshRequest ??= requestTokenRefresh(refreshToken)
    .then((tokens) => {
      // Persist once, before any waiter replays: the old refresh token is now revoked.
      tokenStorage.setTokens(tokens)
      return tokens
    })
    .finally(() => {
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

/** A 4xx (other than 429) means the server rejected the refresh token; anything else is transient. */
function isRefreshRejected(error: unknown) {
  if (!isAxiosError(error) || !error.response) return false
  const { status } = error.response
  return status >= 400 && status < 500 && status !== 429
}

function isGuestRequest(config: InternalAxiosRequestConfig) {
  return Boolean(config.headers?.['X-Hold-Token']) || (config.method === 'post' && config.url === API_ENDPOINTS.bookings.create)
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined
    const status = error.response?.status

    if (status !== 401 || !originalRequest || isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(toApiError(error))
    }

    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken || originalRequest._retry) {
      // A guest (no session) is never sent to the login page: their credential is the hold token.
      if (refreshToken || !isGuestRequest(originalRequest)) redirectToLogin()
      return Promise.reject(toApiError(error))
    }

    originalRequest._retry = true

    try {
      const tokens = await getSharedRefreshRequest(refreshToken)
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
      return axiosClient(originalRequest)
    } catch (refreshError) {
      if (isRefreshRejected(refreshError) || !isAxiosError(refreshError)) {
        redirectToLogin()
      }
      return Promise.reject(toApiError(refreshError))
    }
  },
)
