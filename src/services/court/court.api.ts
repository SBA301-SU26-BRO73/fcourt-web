import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type {
  ApiResponse,
  Court,
  CourtListParams,
  CreateCourtRequest,
  SpringPage,
  SpringPagedPayload,
  UpdateCourtRequest,
} from '@/types/court'

function requireData<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'The server returned no data.')
  }
  return response.data
}

export async function getCourts(params: CourtListParams) {
  const response = await axiosClient.get<ApiResponse<SpringPagedPayload<Court>>>(
    API_ENDPOINTS.courts.list,
    {
      params: {
        page: params.page,
        size: params.size,
        sort: `${params.sortField},${params.sortDirection}`,
      },
    },
  )
  return normalizePage(requireData(response.data))
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
  const response = await axiosClient.get<ApiResponse<Court>>(
    API_ENDPOINTS.courts.detail(courtId),
  )
  return requireData(response.data)
}

export async function createCourt(payload: CreateCourtRequest) {
  const response = await axiosClient.post<ApiResponse<Court>>(
    API_ENDPOINTS.courts.list,
    payload,
  )
  return requireData(response.data)
}

export async function updateCourt(courtId: number, payload: UpdateCourtRequest) {
  const response = await axiosClient.put<ApiResponse<Court>>(
    API_ENDPOINTS.courts.detail(courtId),
    payload,
  )
  return requireData(response.data)
}

export async function deleteCourt(courtId: number) {
  await axiosClient.delete(API_ENDPOINTS.courts.detail(courtId))
}

/**
 * Courts belonging to a branch.
 *
 * The backend exposes a paged, branch-agnostic `GET /api/courts`, so we pull a
 * large page and filter by branch on the client.
 */
export async function getCourtsByBranch(branchId: number): Promise<Court[]> {
  const page = await getCourts({
    page: 0,
    size: 200,
    sortField: 'id',
    sortDirection: 'asc',
  })
  return page.content.filter((court) => court.branchId === branchId)
}
