import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
import type { ApiResponse } from '@/types/court'
import type { CreateProductRequest, Product, UpdateProductRequest } from '@/types/product'

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

function requireData<T>(response: ApiResponse<T>): T {
  if (response.data === undefined) {
    throw new Error(response.message || 'The server returned no data.')
  }
  return response.data
}

/** Admin: products across the branch(es) they own. */
export async function getAdminProducts(): Promise<Product[]> {
  const response = await axiosClient.get<ApiResponse<Product[]>>(API_ENDPOINTS.products.list)
  return requireData(response.data)
}

export async function createProduct(branchId: number, payload: CreateProductRequest) {
  const response = await axiosClient.post<ApiResponse<Product>>(
    API_ENDPOINTS.products.byBranch(branchId),
    payload,
  )
  return requireData(response.data)
}

export async function updateProduct(productId: number, payload: UpdateProductRequest) {
  const response = await axiosClient.put<ApiResponse<Product>>(
    API_ENDPOINTS.products.detail(productId),
    payload,
  )
  return requireData(response.data)
}

export async function deleteProduct(productId: number) {
  await axiosClient.delete(API_ENDPOINTS.products.detail(productId))
}
