import { axiosClient } from "../http/axios-client";
import { API_ENDPOINTS } from "@/common/constants/api-endpoints";
import type {
  ApiResponse as AdminApiResponse,
  Branch as AdminBranch,
  BranchListParams,
  CreateBranchRequest,
  SpringPage,
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
}

export interface BranchFilterRequest {
  name?: string;
  address?: string;
  ward?: string;
  city?: string;
  phone?: string;
  status?: string;
  courtTypeName?: string; 
}

export interface ApiResponse<T> {
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
}

export interface CourtResponse {
  id: number;
  branchId: number;
  branchName: string;
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
    const response = await axiosClient.get<ApiResponse<PageContent<Branch>>>('/branches', {
      params: { page, size }
    });
    return response.data.data;
  },

  search: async (filters: BranchFilterRequest, page: number = 0, size: number = 6): Promise<PageContent<Branch>> => {
    const response = await axiosClient.get<ApiResponse<PageContent<Branch>>>('/branches/search', {
      params: { 
        ...filters,
        page: page + 1, 
        size: size 
      }
    });
    return response.data.data;
  },

  getById: async (id: string | number): Promise<Branch> => {
    const response = await axiosClient.get<ApiResponse<Branch>>(`/branches/${id}`);
    return response.data.data;
  },

  getCourtsByBranch: async (branchId: string | number): Promise<CourtResponse[]> => {
    const response = await axiosClient.get<ApiResponse<CourtResponse[]>>(`/branches/${branchId}/courts`);
    return response.data.data;
  },

  getDailyCourtSchedule: async (courtId: number, date: string): Promise<DailySlotResponse[]> => {
    const response = await axiosClient.get<ApiResponse<DailySlotResponse[]>>(`/courts/${courtId}/daily-schedule`, {
      params: { date }
    });
    return response.data.data;
  },
};

// Admin Side Helper
function requireData<T>(response: AdminApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'The server returned no data.')
  }
  return response.data
}

// Admin Side API Functions
export async function getBranches(params: BranchListParams) {
  const response = await axiosClient.get<AdminApiResponse<SpringPage<AdminBranch>>>(
    API_ENDPOINTS.branches.list,
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

export async function getBranchDetail(branchId: number) {
  const response = await axiosClient.get<AdminApiResponse<AdminBranch>>(
    API_ENDPOINTS.branches.detail(branchId),
  )
  return requireData(response.data)
}

export async function createBranch(payload: CreateBranchRequest) {
  const response = await axiosClient.post<AdminApiResponse<AdminBranch>>(
    API_ENDPOINTS.branches.list,
    payload,
  )
  return requireData(response.data)
}

export async function updateBranch(
  branchId: number,
  payload: UpdateBranchRequest,
) {
  const response = await axiosClient.put<AdminApiResponse<AdminBranch>>(
    API_ENDPOINTS.branches.detail(branchId),
    payload,
  )
  return requireData(response.data)
}

export async function deleteBranch(branchId: number) {
  await axiosClient.delete(API_ENDPOINTS.branches.detail(branchId))
}