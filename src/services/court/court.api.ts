import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { pageOf, sortedBy } from '@/common/utils/paging'
import { axiosClient } from '@/services/http/axios-client'
import type { Branch } from '@/types/branch'
import type {
  Court,
  CourtDto,
  CourtListParams,
  CourtRequest,
  CourtStatus,
  CreateCourtRequest,
  UpdateCourtRequest,
} from '@/types/court'

type NamedType = { id: number; name: string }

/** `GET /court-types` may answer with an array or a page; both are read. */
async function getCourtTypeNames(): Promise<Map<number, string>> {
  const response = await axiosClient.get<NamedType[] | { content?: NamedType[] }>(
    API_ENDPOINTS.courtTypes.list,
    { params: { size: 100 } },
  )
  const raw = response.data
  const list = Array.isArray(raw) ? raw : (raw?.content ?? [])
  return new Map(list.map((type) => [type.id, type.name]))
}

/** CourtResponse has neither branch nor court-type names, so they are joined in here. */
export function toCourt(
  dto: CourtDto,
  branch: Pick<Branch, 'name' | 'slotDurationMinutes'> | undefined,
  typeNames: Map<number, string>,
): Court {
  return {
    ...dto,
    branchName: branch?.name ?? `Chi nhánh #${dto.branchId}`,
    courtTypeName: typeNames.get(dto.courtTypeId) ?? `Loại sân #${dto.courtTypeId}`,
    slotDurationMinutes: branch?.slotDurationMinutes ?? 30,
  }
}

async function getCourtDtos(branchId: number) {
  const response = await axiosClient.get<CourtDto[]>(API_ENDPOINTS.adminBranches.courts(branchId))
  return response.data
}

async function getBranchRef(branchId: number) {
  const response = await axiosClient.get<Branch>(API_ENDPOINTS.adminBranches.detail(branchId))
  return response.data
}

/** Courts of one branch (the only list the backend offers). */
export async function getCourtsByBranch(branchId: number): Promise<Court[]> {
  const [dtos, branch, typeNames] = await Promise.all([
    getCourtDtos(branchId),
    getBranchRef(branchId),
    getCourtTypeNames(),
  ])
  return dtos.map((dto) => toCourt(dto, branch, typeNames))
}

/** Every court of the owner: one request per branch, merged, sorted and paged on the client. */
export async function getCourts(params: CourtListParams) {
  const [branchesResponse, typeNames] = await Promise.all([
    axiosClient.get<Branch[]>(API_ENDPOINTS.adminBranches.list),
    getCourtTypeNames(),
  ])
  const branches = branchesResponse.data
  const lists = await Promise.all(
    branches.map(async (branch) =>
      (await getCourtDtos(branch.id)).map((dto) => toCourt(dto, branch, typeNames)),
    ),
  )
  return pageOf(sortedBy(lists.flat(), params.sortField, params.sortDirection), params.page, params.size)
}

export async function getCourtDetail(courtId: number): Promise<Court> {
  const response = await axiosClient.get<CourtDto>(API_ENDPOINTS.courts.detail(courtId))
  const [branch, typeNames] = await Promise.all([getBranchRef(response.data.branchId), getCourtTypeNames()])
  return toCourt(response.data, branch, typeNames)
}

export async function createCourt(branchId: number, payload: CreateCourtRequest) {
  const response = await axiosClient.post<CourtDto>(API_ENDPOINTS.adminBranches.courts(branchId), payload)
  return response.data
}

export async function updateCourt(courtId: number, payload: UpdateCourtRequest) {
  const response = await axiosClient.put<CourtDto>(API_ENDPOINTS.courts.detail(courtId), payload)
  return response.data
}

/** PATCH /admin/courts/{id}/status with `{ status }`: ACTIVE, MAINTENANCE or INACTIVE. */
export async function changeCourtStatus(courtId: number, status: CourtStatus) {
  const response = await axiosClient.patch<CourtDto>(API_ENDPOINTS.courts.status(courtId), { status })
  return response.data
}

export async function deleteCourt(courtId: number) {
  await axiosClient.delete(API_ENDPOINTS.courts.detail(courtId))
}

/** Multipart field `file`; JPEG, PNG or WebP up to 5 MB. Replaces the current photo and returns the updated court. */
export async function uploadCourtImage(courtId: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axiosClient.post<CourtDto>(API_ENDPOINTS.courts.image(courtId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  })
  return response.data
}

export async function deleteCourtImage(courtId: number) {
  const response = await axiosClient.delete<CourtDto>(API_ENDPOINTS.courts.image(courtId))
  return response.data
}

export type { CourtRequest }
