import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { ApiResponse, ChangePasswordRequest, LoginRequest, RegisterCustomerRequest, TokenResponse, UpdateProfileRequest, UserProfile } from '@/types/auth'

export async function login(data: LoginRequest): Promise<ApiResponse<TokenResponse>> {
  const response = await axiosClient.post(API_ENDPOINTS.auth.login, data)
  return response.data
}

export async function registerCustomer(
  data: RegisterCustomerRequest,
): Promise<ApiResponse<TokenResponse>> {
  const response = await axiosClient.post(API_ENDPOINTS.auth.registerCustomer, data)
  return response.data
}

export async function registerCourtOwner(data: FormData): Promise<ApiResponse<void>> {
  const response = await axiosClient.post(API_ENDPOINTS.auth.registerCourtOwner, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function refreshToken(token: string): Promise<ApiResponse<TokenResponse>> {
  const response = await axiosClient.post(API_ENDPOINTS.auth.refresh, { refreshToken: token })
  return response.data
}

export async function getProfile(): Promise<ApiResponse<UserProfile>> {
  const response = await axiosClient.get(API_ENDPOINTS.auth.profile)
  return response.data
}

export async function updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
  const response = await axiosClient.patch(API_ENDPOINTS.auth.profile, data)
  return response.data
}

export async function changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
  const response = await axiosClient.patch(API_ENDPOINTS.auth.changePassword, data)
  return response.data
}
