import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { PageResponse, UserAdminItem } from '@/types/admin'
import type { ApiResponse } from '@/types/auth'

export async function getPendingUsers(): Promise<ApiResponse<PageResponse<UserAdminItem>>> {
  const res = await axiosClient.get(API_ENDPOINTS.users.list, {
    params: { role: 'ADMIN', status: 'PENDING_APPROVAL', size: 100 },
  })
  return res.data
}

export async function approveUser(id: number): Promise<ApiResponse<UserAdminItem>> {
  const res = await axiosClient.patch(API_ENDPOINTS.users.approve(id))
  return res.data
}

export async function rejectUser(id: number): Promise<ApiResponse<UserAdminItem>> {
  const res = await axiosClient.patch(API_ENDPOINTS.users.reject(id))
  return res.data
}
