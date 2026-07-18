import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'

export async function getProducts() {
  const response = await axiosClient.get(API_ENDPOINTS.products.list)
  return response.data
}

export async function getProductDetail(productId: string | number) {
  const response = await axiosClient.get(
    API_ENDPOINTS.products.detail(productId),
  )
  return response.data
}
