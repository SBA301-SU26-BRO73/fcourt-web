import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type {  Court,
  CourtListParams,
  CreateCourtRequest,
  SpringPage,
  SpringPagedPayload,
  UpdateCourtRequest,
} from '@/types/court'

// TODO(F7): the backend lists courts per branch only (GET /admin/branches/{branchId}/courts). Until the
// screens work per branch, gather the owner's branches and merge their courts, then page on the client.
export async function getCourts(params: CourtListParams) {
  const branchesResponse = await axiosClient.get<unknown>(API_ENDPOINTS.adminBranches.list)
  const raw = branchesResponse.data
  const branches: Array<{ id: number }> = Array.isArray(raw)
    ? raw
    : ((raw as { content?: Array<{ id: number }> } | null)?.content ?? [])
  const lists = await Promise.all(
    branches.map((branch) => getCourtsOfBranch(branch.id)),
  )
  const all = lists.flat()
  const field = params.sortField as keyof Court
  const sign = params.sortDirection === 'desc' ? -1 : 1
  all.sort((x, y) => {
    const a = x[field] ?? ""
    const b = y[field] ?? ""
    return a > b ? sign : a < b ? -sign : 0
  })
  const start = params.page * params.size
  return normalizePage<Court>({
    content: all.slice(start, start + params.size),
    size: params.size,
    number: params.page,
    totalElements: all.length,
    totalPages: Math.ceil(all.length / Math.max(params.size, 1)),
  })
}

async function getCourtsOfBranch(branchId: number): Promise<Court[]> {
  const response = await axiosClient.get<Court[]>(API_ENDPOINTS.adminBranches.courts(branchId))
  return response.data
}

function normalizePage<T>(payload: SpringPagedPayload<T>): SpringPage<T> {
  const metadata = payload.page ?? payload
  const size = metadata.size ?? payload.content.length
  const number = metadata.number ?? 0
  const totalElements = metadata.totalElements ?? payload.content.length
  const totalPages = metadata.totalPages ?? (totalElements === 0 ? 0 : Math.ceil(totalElements / Math.max(size, 1)))
  const numberOfElements = payload.numberOfElements ?? payload.content.length

  return {
    content: payload.content,
    size,
    number,
    totalElements,
    totalPages,
    numberOfElements,
    first: payload.first ?? number === 0,
    last: payload.last ?? (totalPages === 0 || number >= totalPages - 1),
    empty: payload.empty ?? numberOfElements === 0,
  }
}

export async function getCourtDetail(courtId: number) {
  const response = await axiosClient.get<Court>(
    API_ENDPOINTS.courts.detail(courtId),
  )
  return response.data
}

// TODO(F7): the body no longer takes branchId (it moves into the path); status adds MAINTENANCE.
export async function createCourt(payload: CreateCourtRequest) {
  const response = await axiosClient.post<Court>(
    API_ENDPOINTS.adminBranches.courts(payload.branchId),
    payload,
  )
  return response.data
}

export async function updateCourt(courtId: number, payload: UpdateCourtRequest) {
  const response = await axiosClient.put<Court>(
    API_ENDPOINTS.courts.detail(courtId),
    payload,
  )
  return response.data
}

export async function deleteCourt(courtId: number) {
  await axiosClient.delete(API_ENDPOINTS.courts.detail(courtId))
}

/** Courts belonging to a branch. */
export async function getCourtsByBranch(branchId: number): Promise<Court[]> {
  return getCourtsOfBranch(branchId)
}
