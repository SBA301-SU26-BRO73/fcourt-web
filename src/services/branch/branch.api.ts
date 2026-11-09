import { axiosClient } from "../http/axios-client";
import { API_ENDPOINTS } from "@/common/constants/api-endpoints";
import { pageOf, sortedBy } from "@/common/utils/paging";
import type {
  Branch as AdminBranch,
  BranchImage,
  BranchListParams,
  BranchRequest,
  BranchStatus,
  CreateBranchRequest,
  UpdateBranchRequest,
} from "@/types/branch";

// Client Side Types
export interface Branch {
  id: number;
  adminId: number;
  adminName: string;
  name: string;
  address: string;
  ward: string | null;
  city: string;
  phone: string | null;
  openTime: string;
  closeTime: string;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  bankName: string | null;
  bankQrImageUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  sampleImageUrl: string | null;
  courtTypeNames: string[];
}

export interface BranchFilterRequest {
  keyword?: string;
  name?: string;
  address?: string;
  ward?: string;
  city?: string;
  phone?: string;
  status?: string;
  courtTypeName?: string; 
}

export interface T {
  httpStatus: number;
  data: T;
  message: string;
}

export interface PageContent<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; 
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

function normalizePage<T>(page: PageContent<T>): PageContent<T> {
  const metadata = page.page ?? page;
  return {
    content: page.content,
    size: metadata.size,
    number: metadata.number,
    totalElements: metadata.totalElements,
    totalPages: metadata.totalPages,
  };
}

export interface CourtResponse {
  id: number;
  branchId: number;
  branchName: string;
  slotDurationMinutes: 30 | 60;
  name: string;
  courtTypeId: number;
  courtTypeName: string;
  description: string;
  imageUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface DailySlotResponse {
  startTime: string;
  endTime: string;
  price: number;
  status: 'EXPIRED' | 'AVAILABLE' | 'BOOKED' | 'HOLDING';
}

// Client Side API
export const branchApi = {
  getAll: async (page: number = 0, size: number = 6): Promise<PageContent<Branch>> => {
    // TODO(F2): slot-booking still uses this legacy shape; customer browse (F1) uses public-branch.api.ts.
    const response = await axiosClient.get<PageContent<Branch>>(API_ENDPOINTS.branches.list, {
      params: { page, size }
    });
    return normalizePage(response.data);
  },

  getById: async (id: string | number): Promise<Branch> => {
    const response = await axiosClient.get<Branch>(API_ENDPOINTS.branches.detail(id));
    return response.data;
  },

  getCourtsByBranch: async (branchId: string | number): Promise<CourtResponse[]> => {
    const response = await axiosClient.get<CourtResponse[]>(API_ENDPOINTS.branches.courts(branchId));
    return response.data;
  },

  getDailyCourtSchedule: async (courtId: number, date: string): Promise<DailySlotResponse[]> => {
    // TODO(F2): slots are identified by slotId and status HOLD replaces HOLDING (gap report 2.3, row 30).
    const response = await axiosClient.get<DailySlotResponse[]>(API_ENDPOINTS.courtSlots(courtId), {
      params: { date }
    });
    return response.data;
  },
};

// Admin Side API Functions (facility-service, role ADMIN)

/** The backend returns every branch of the owner as one array, with no paging. */
export async function listBranches() {
  const response = await axiosClient.get<AdminBranch[]>(API_ENDPOINTS.adminBranches.list)
  return response.data
}

export async function getBranches(params: BranchListParams) {
  const all = await listBranches()
  return pageOf(sortedBy(all, params.sortField, params.sortDirection), params.page, params.size)
}

export async function getBranchDetail(branchId: number) {
  const response = await axiosClient.get<AdminBranch>(
    API_ENDPOINTS.adminBranches.detail(branchId),
  )
  return response.data
}

export async function createBranch(payload: CreateBranchRequest) {
  const response = await axiosClient.post<AdminBranch>(
    API_ENDPOINTS.adminBranches.list,
    payload,
  )
  return response.data
}

export async function updateBranch(
  branchId: number,
  payload: UpdateBranchRequest,
) {
  const response = await axiosClient.put<AdminBranch>(
    API_ENDPOINTS.adminBranches.detail(branchId),
    payload,
  )
  return response.data
}

export async function deleteBranch(branchId: number) {
  await axiosClient.delete(API_ENDPOINTS.adminBranches.detail(branchId))
}

/** Rebuilds the full-replacement body from a stored branch, optionally with another status. */
export function branchToRequest(branch: AdminBranch, status: BranchStatus = branch.status): BranchRequest {
  return {
    name: branch.name,
    address: branch.address,
    ward: branch.ward,
    district: branch.district,
    city: branch.city,
    latitude: branch.latitude,
    longitude: branch.longitude,
    phone: branch.phone,
    openTime: branch.openTime.slice(0, 5),
    closeTime: branch.closeTime.slice(0, 5),
    slotDurationMinutes: branch.slotDurationMinutes,
    bankName: branch.bankName,
    bankBin: branch.bankBin,
    bankAccountNumber: branch.bankAccountNumber,
    bankAccountName: branch.bankAccountName,
    status,
  }
}

/** There is no status endpoint for branches: activate/deactivate is a PUT with the new status. */
export async function setBranchStatus(branch: AdminBranch, status: BranchStatus) {
  return updateBranch(branch.id, branchToRequest(branch, status))
}

export async function getBranchImages(branchId: number) {
  const response = await axiosClient.get<BranchImage[]>(API_ENDPOINTS.adminBranches.images(branchId))
  return [...response.data].sort((a, b) => a.sortOrder - b.sortOrder)
}

/** Multipart field name is `files` (repeatable); JPEG, PNG or WebP, up to 5 MB each, 10 per branch. */
export async function uploadBranchImages(branchId: number, files: File[]) {
  const formData = new FormData()
  for (const file of files) formData.append('files', file)
  const response = await axiosClient.post<BranchImage[]>(
    API_ENDPOINTS.adminBranches.images(branchId),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60_000 },
  )
  return response.data
}

export async function deleteBranchImage(imageId: number) {
  await axiosClient.delete(API_ENDPOINTS.adminBranches.image(imageId))
}
