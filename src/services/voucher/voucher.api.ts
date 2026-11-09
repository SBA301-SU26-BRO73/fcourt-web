import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type {  CreateVoucherRequest,
  SpringPage,
  UpdateVoucherRequest,
  Voucher,
  VoucherListParams,
} from '@/types/voucher'

// TODO(F10): response is now { items, page, size, total } and the create body needs branchId.
export async function getVouchers(params: VoucherListParams) {
  const response = await axiosClient.get<SpringPage<Voucher>>(
    API_ENDPOINTS.vouchers.list,
    {
      params: {
        page: params.page,
        size: params.size,
      },
    },
  )
  return response.data
}

export async function getVoucherDetail(voucherId: number) {
  const response = await axiosClient.get<Voucher>(
    API_ENDPOINTS.vouchers.detail(voucherId),
  )
  return response.data
}

// TODO(F4): replaced by POST /vouchers/apply on an existing booking.
export async function getVoucherByCode(code: string) {
  const response = await axiosClient.get<Voucher>(
    API_ENDPOINTS.vouchers.code(code),
  )
  return response.data
}

export async function createVoucher(payload: CreateVoucherRequest) {
  const response = await axiosClient.post<Voucher>(
    API_ENDPOINTS.vouchers.list,
    payload,
  )
  return response.data
}

export async function updateVoucher(voucherId: number, payload: UpdateVoucherRequest) {
  const response = await axiosClient.put<Voucher>(
    API_ENDPOINTS.vouchers.detail(voucherId),
    payload,
  )
  return response.data
}

export async function deleteVoucher(voucherId: number) {
  await axiosClient.delete(API_ENDPOINTS.vouchers.detail(voucherId))
}
