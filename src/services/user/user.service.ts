import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { PageResponse, UserAdminItem } from '@/types/admin'
import type { ApiResponse, UserRole, UserStatus } from '@/types/auth'

export interface UserListParams {
  role?: Extract<UserRole, 'CUSTOMER' | 'ADMIN'> | ''
  status?: UserStatus | ''
  page?: number
  size?: number
}

export interface UserManagementPageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

interface SpringPagedPayload<T> {
  content: T[]
  totalElements?: number
  totalPages?: number
  size?: number
  number?: number
  page?: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

function normalizeUserManagementPage<T>(page: SpringPagedPayload<T>): UserManagementPageResponse<T> {
  const metadata = page.page ?? page
  return {
    content: page.content,
    size: metadata.size ?? page.content.length,
    number: metadata.number ?? 0,
    totalElements: metadata.totalElements ?? page.content.length,
    totalPages: metadata.totalPages ?? 1,
  }
}

export async function getPendingUsers(): Promise<ApiResponse<PageResponse<UserAdminItem>>> {
  const res = await axiosClient.get(API_ENDPOINTS.users.list, {
    params: { role: 'ADMIN', status: 'PENDING_APPROVAL', size: 100 },
  })
  return res.data
}

export async function getUsers(params: UserListParams): Promise<ApiResponse<UserManagementPageResponse<UserAdminItem>>> {
  const res = await axiosClient.get<ApiResponse<SpringPagedPayload<UserAdminItem>>>(API_ENDPOINTS.users.list, {
    params: {
      role: params.role || undefined,
      status: params.status || undefined,
      page: params.page ?? 0,
      size: params.size ?? 10,
    },
  })
  return {
    ...res.data,
    data: res.data.data ? normalizeUserManagementPage(res.data.data) : undefined,
  }
}

export async function approveUser(id: number): Promise<ApiResponse<UserAdminItem>> {
  const res = await axiosClient.patch(API_ENDPOINTS.users.approve(id))
  return res.data
}

export async function rejectUser(id: number): Promise<ApiResponse<UserAdminItem>> {
  const res = await axiosClient.patch(API_ENDPOINTS.users.reject(id))
  return res.data
}

export async function lockUser(id: number, reason: string): Promise<ApiResponse<UserAdminItem>> {
  const res = await axiosClient.patch(API_ENDPOINTS.users.lock(id), { reason })
  return res.data
}

export async function unlockUser(id: number): Promise<ApiResponse<UserAdminItem>> {
  const res = await axiosClient.patch(API_ENDPOINTS.users.unlock(id))
  return res.data
}
