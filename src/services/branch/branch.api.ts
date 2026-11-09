import { axiosClient } from "../http/axios-client";
import { API_ENDPOINTS } from "@/common/constants/api-endpoints";
import type {  Branch as AdminBranch,
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

// Admin Side Helper
// Admin Side API Functions
export async function getBranches(params: BranchListParams) {
  const response = await axiosClient.get<SpringPage<AdminBranch>>(
    API_ENDPOINTS.adminBranches.list,
    {
      // TODO(F7): GET /admin/branches returns the owner's branches without paging parameters.
      params: {
        page: params.page,
        size: params.size,
        sort: `${params.sortField},${params.sortDirection}`,
      },
    },
  )
  return response.data
}

export async function getBranchDetail(branchId: number) {
  const response = await axiosClient.get<AdminBranch>(
    API_ENDPOINTS.adminBranches.detail(branchId),
  )
  return response.data
}

// TODO(F7): the create/update body now requires bankName, bankBin, bankAccountNumber, bankAccountName.
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
