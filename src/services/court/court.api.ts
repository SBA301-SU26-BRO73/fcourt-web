import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type {
  ApiResponse,
  Court,
  CourtListParams,
  CreateCourtRequest,
  SpringPage,
  UpdateCourtRequest,
} from '@/types/court'

function requireData<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'The server returned no data.')
  }
  return response.data
}

export async function getCourts(params: CourtListParams) {
  const response = await axiosClient.get<ApiResponse<SpringPage<Court>>>(
    API_ENDPOINTS.courts.list,
    {
      params: {
        page: params.page,
        size: params.size,
        sort: `${params.sortField},${params.sortDirection}`,
      },
    },
  )
  return requireData(response.data)
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
