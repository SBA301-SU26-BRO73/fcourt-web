import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type {
  ChangePasswordRequest,
  LoginRequest,
  RegisterCourtOwnerResponse,
  RegisterCustomerRequest,
  TokenResponse,
  UpdateProfileRequest,
  UserProfile,
} from '@/types/auth'

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const response = await axiosClient.post<TokenResponse>(API_ENDPOINTS.auth.login, data)
  return response.data
}

export async function registerCustomer(data: RegisterCustomerRequest): Promise<TokenResponse> {
  const response = await axiosClient.post<TokenResponse>(API_ENDPOINTS.auth.registerCustomer, data)
  return response.data
}

export async function registerCourtOwner(data: FormData): Promise<RegisterCourtOwnerResponse> {
  const response = await axiosClient.post<RegisterCourtOwnerResponse>(
    API_ENDPOINTS.auth.registerCourtOwner,
    data,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

/** Refresh tokens rotate: the caller must store the returned `refreshToken`. */
export async function refreshToken(token: string): Promise<TokenResponse> {
  const response = await axiosClient.post<TokenResponse>(API_ENDPOINTS.auth.refresh, {
    refreshToken: token,
  })
  return response.data
}

/** Revokes the refresh token server-side (204, idempotent). */
export async function logout(token: string): Promise<void> {
  await axiosClient.post(API_ENDPOINTS.auth.logout, { refreshToken: token })
}

export async function getProfile(): Promise<UserProfile> {
  const response = await axiosClient.get<UserProfile>(API_ENDPOINTS.auth.profile)
  return response.data
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  const response = await axiosClient.patch<UserProfile>(API_ENDPOINTS.auth.profile, data)
  return response.data
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await axiosClient.patch(API_ENDPOINTS.auth.changePassword, data)
}

/** Always 202 with a generic message: the API never reveals whether the email is registered. */
export async function forgotPassword(email: string): Promise<string> {
  const response = await axiosClient.post<{ message: string }>(API_ENDPOINTS.auth.forgotPassword, { email })
  return response.data.message
}

/** `token` comes from the `?token=` of the emailed link; it works once. */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await axiosClient.post(API_ENDPOINTS.auth.resetPassword, { token, newPassword })
}

/** Exchanges a Google Identity Services ID token (the `credential`) for an FCOURT session. Customers only. */
export async function googleLogin(idToken: string): Promise<TokenResponse> {
  const response = await axiosClient.post<TokenResponse>(API_ENDPOINTS.auth.google, { idToken })
  return response.data
}

/** Multipart part `file`, at most 2 MB. Returns the updated profile. */
export async function uploadAvatar(file: File): Promise<UserProfile> {
  const form = new FormData()
  form.append('file', file)
  const response = await axiosClient.put<UserProfile>(API_ENDPOINTS.auth.avatar, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function removeAvatar(): Promise<UserProfile> {
  const response = await axiosClient.delete<UserProfile>(API_ENDPOINTS.auth.avatar)
  return response.data
}
