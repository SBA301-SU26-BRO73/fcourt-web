import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { PageResponse, UserAdminItem, UserDetailItem } from '@/types/admin'
import type { UserRole, UserStatus } from '@/types/auth'

export interface UserListParams {
  role?: Extract<UserRole, 'CUSTOMER' | 'ADMIN' | 'STAFF'> | ''
  status?: UserStatus | ''
  /** Matches email, full name or phone (server side, max 100 characters). */
  query?: string
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

/** GET /super-admin/users body: auth-service UserPage. `page` is zero based, `total` the match count. */
export interface ApiUserPage {
  items: UserAdminItem[]
  page: number
  size: number
  total: number
}

export function toUserManagementPage(body: ApiUserPage): UserManagementPageResponse<UserAdminItem> {
  const size = body.size > 0 ? body.size : 1
  return {
    content: body.items,
    size: body.size,
    number: body.page,
    totalElements: body.total,
    totalPages: Math.ceil(body.total / size),
  }
}

/** Pending court owners. The backend returns a bare array; wrap it so pages keep the page shape. */
export async function getPendingUsers(): Promise<PageResponse<UserAdminItem>> {
  const res = await axiosClient.get<UserAdminItem[]>(API_ENDPOINTS.users.pending)
  const content = res.data
  return { content, totalElements: content.length, totalPages: 1, size: content.length, number: 0 }
}

/** Needs GET /api/super-admin/users in auth-service (SUPER_ADMIN, paged, filtered by role/status/query). */
export async function getUsers(params: UserListParams): Promise<UserManagementPageResponse<UserAdminItem>> {
  const query = params.query?.trim()
  const res = await axiosClient.get<ApiUserPage>(API_ENDPOINTS.users.list, {
    params: {
      role: params.role || undefined,
      status: params.status || undefined,
      query: query ? query.slice(0, 100) : undefined,
      page: params.page ?? 0,
      size: params.size ?? 10,
    },
  })
  return toUserManagementPage(res.data)
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

export interface UserStatusResult {
  id: number
  status: UserStatus
}

/** Lock and unlock share PUT toggle-status: ACTIVE becomes LOCKED (reason required), LOCKED becomes ACTIVE. */
export async function lockUser(id: number, reason: string): Promise<UserStatusResult> {
  const res = await axiosClient.put<UserStatusResult>(API_ENDPOINTS.users.toggleStatus(id), { reason })
  return res.data
}

export async function unlockUser(id: number): Promise<UserStatusResult> {
  const res = await axiosClient.put<UserStatusResult>(API_ENDPOINTS.users.toggleStatus(id))
  return res.data
}
