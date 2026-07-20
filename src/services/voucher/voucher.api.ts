import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type {
  ApiResponse,
  CreateVoucherRequest,
  SpringPage,
  UpdateVoucherRequest,
  Voucher,
  VoucherListParams,
} from '@/types/voucher'

function requireData<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'The server returned no data.')
  }
  return response.data
}

export async function getVouchers(params: VoucherListParams) {
  const response = await axiosClient.get<ApiResponse<SpringPage<Voucher>>>(
    API_ENDPOINTS.vouchers.list,
    {
      params: {
        page: params.page,
        size: params.size,
      },
    },
  )
  return requireData(response.data)
}

export async function getVoucherDetail(voucherId: number) {
  const response = await axiosClient.get<ApiResponse<Voucher>>(
    API_ENDPOINTS.vouchers.detail(voucherId),
  )
  return requireData(response.data)
}

export async function getVoucherByCode(code: string) {
  const response = await axiosClient.get<ApiResponse<Voucher>>(
    API_ENDPOINTS.vouchers.code(code),
  )
  return requireData(response.data)
}

export async function createVoucher(payload: CreateVoucherRequest) {
  const response = await axiosClient.post<ApiResponse<Voucher>>(
    API_ENDPOINTS.vouchers.list,
    payload,
  )
  return requireData(response.data)
}

export async function updateVoucher(voucherId: number, payload: UpdateVoucherRequest) {
  const response = await axiosClient.put<ApiResponse<Voucher>>(
    API_ENDPOINTS.vouchers.detail(voucherId),
    payload,
  )
  return requireData(response.data)
}

export async function deleteVoucher(voucherId: number) {
  await axiosClient.delete(API_ENDPOINTS.vouchers.detail(voucherId))
}
