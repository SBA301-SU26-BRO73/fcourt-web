import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { PageResponse, UserAdminItem, UserDetailItem } from '@/types/admin'
import type { UserRole, UserStatus } from '@/types/auth'

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

/** Pending court owners. The backend returns a bare array; wrap it so pages keep the page shape. */
export async function getPendingUsers(): Promise<PageResponse<UserAdminItem>> {
  const res = await axiosClient.get<UserAdminItem[]>(API_ENDPOINTS.users.pending)
  const content = res.data
  return { content, totalElements: content.length, totalPages: 1, size: content.length, number: 0 }
}

// TODO(F14): the backend has no endpoint that lists all users (customers and owners) with
// role/status filters, so this call is expected to fail until the team decides (gap report 3.2 item 1).
export async function getUsers(params: UserListParams): Promise<UserManagementPageResponse<UserAdminItem>> {
  const res = await axiosClient.get<SpringPagedPayload<UserAdminItem>>(API_ENDPOINTS.users.list, {
    params: {
      role: params.role || undefined,
      status: params.status || undefined,
      page: params.page ?? 0,
      size: params.size ?? 10,
    },
  })
  return normalizeUserManagementPage(res.data)
}

export async function getUserDetail(id: number): Promise<UserDetailItem> {
  const res = await axiosClient.get<UserDetailItem>(API_ENDPOINTS.users.detail(id))
  return res.data
}

export async function approveUser(id: number): Promise<UserAdminItem> {
  const res = await axiosClient.put<UserAdminItem>(API_ENDPOINTS.users.approve(id))
  return res.data
}

export async function rejectUser(id: number, reason = 'Rejected by super admin'): Promise<UserAdminItem> {
  const res = await axiosClient.put<UserAdminItem>(API_ENDPOINTS.users.reject(id), { reason })
  return res.data
}

// TODO(F14): lock and unlock are merged into one toggle-status call (PUT, optional reason) that
// returns { id, status }. Both helpers hit it until the user-management screen is reworked.
export async function lockUser(id: number, reason: string): Promise<UserAdminItem> {
  const res = await axiosClient.put<UserAdminItem>(API_ENDPOINTS.users.toggleStatus(id), { reason })
  return res.data
}

export async function unlockUser(id: number): Promise<UserAdminItem> {
  const res = await axiosClient.put<UserAdminItem>(API_ENDPOINTS.users.toggleStatus(id))
  return res.data
}
