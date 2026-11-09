import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { pageFromApi } from '@/common/utils/api-page'
import { axiosClient } from '@/services/http/axios-client'
import type {
  LegacyVoucher,
  Voucher,
  VoucherApiPage,
  VoucherListParams,
  VoucherRequest,
  VoucherStatus,
  VoucherUsage,
  VoucherUsageApiPage,
  VoucherUsagePage,
  VoucherUsageParams,
} from '@/types/voucher'

/** `GET /admin/vouchers?page&size[&branchId]` answers `{ items, page, size, total }`. */
export async function getVouchers(params: VoucherListParams) {
  const response = await axiosClient.get<VoucherApiPage<Voucher>>(API_ENDPOINTS.vouchers.list, {
    params: {
      page: params.page,
      size: params.size,
      ...(params.branchId ? { branchId: params.branchId } : {}),
    },
  })
  return pageFromApi(response.data)
}

export async function getVoucherDetail(voucherId: number) {
  const response = await axiosClient.get<Voucher>(API_ENDPOINTS.vouchers.detail(voucherId))
  return response.data
}

// TODO(F4): replaced by POST /vouchers/apply on an existing booking.
export async function getVoucherByCode(code: string) {
  const response = await axiosClient.get<LegacyVoucher>(API_ENDPOINTS.vouchers.code(code))
  return response.data
}

export async function createVoucher(payload: VoucherRequest) {
  const response = await axiosClient.post<Voucher>(API_ENDPOINTS.vouchers.list, payload)
  return response.data
}

export async function updateVoucher(voucherId: number, payload: VoucherRequest) {
  const response = await axiosClient.put<Voucher>(API_ENDPOINTS.vouchers.detail(voucherId), payload)
  return response.data
}

/** Soft delete on the server (the row is kept, flagged deleted). */
export async function deleteVoucher(voucherId: number) {
  await axiosClient.delete(API_ENDPOINTS.vouchers.detail(voucherId))
}

/** The request that would leave the voucher as it is, optionally with another status. */
export function voucherToRequest(voucher: Voucher, status: VoucherStatus = voucher.status): VoucherRequest {
  return {
    code: voucher.code,
    branchId: voucher.branchId,
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    maxDiscountAmount: voucher.maxDiscountAmount,
    minOrderAmount: voucher.minOrderAmount,
    startDate: voucher.startDate,
    endDate: voucher.endDate,
    usageLimit: voucher.usageLimit,
    status,
  }
}

/** There is no disable endpoint: a voucher is switched off by PUT with status EXPIRED. */
export async function setVoucherStatus(voucher: Voucher, status: VoucherStatus) {
  return updateVoucher(voucher.id, voucherToRequest(voucher, status))
}

/** `GET /admin/vouchers/{id}/usages?phone&page&size`, with the total discount given. */
export async function getVoucherUsages(
  voucherId: number,
  params: VoucherUsageParams,
): Promise<VoucherUsagePage> {
  const response = await axiosClient.get<VoucherUsageApiPage>(API_ENDPOINTS.vouchers.usages(voucherId), {
    params: {
      page: params.page,
      size: params.size,
      ...(params.phone?.trim() ? { phone: params.phone.trim() } : {}),
    },
  })
  return { ...pageFromApi<VoucherUsage>(response.data), totalDiscountAmount: response.data.totalDiscountAmount ?? 0 }
}

export interface OwnerBranchOption {
  id: number
  name: string
}

/** Branches of the owner for the branch pickers (`GET /admin/branches` is a plain array). */
export async function getOwnerBranches(): Promise<OwnerBranchOption[]> {
  const response = await axiosClient.get<OwnerBranchOption[] | { content?: OwnerBranchOption[] }>(
    API_ENDPOINTS.adminBranches.list,
  )
  const raw = response.data
  const list = Array.isArray(raw) ? raw : (raw?.content ?? [])
  return list.map(({ id, name }) => ({ id, name }))
}
