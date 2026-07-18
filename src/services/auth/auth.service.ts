import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { ApiResponse, LoginRequest, RegisterCustomerRequest, TokenResponse } from '@/types/auth'

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
