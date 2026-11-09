import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { axiosClient } from '@/services/http/axios-client'
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

/** Admin: products across the branch(es) they own. */
export async function getAdminProducts(): Promise<Product[]> {
  const response = await axiosClient.get<Product[]>(API_ENDPOINTS.products.list)
  return response.data
}

export async function createProduct(_branchId: number, payload: CreateProductRequest) {
  const response = await axiosClient.post<Product>(
    // TODO(F11): the branch is no longer in the path; check the body of POST /admin/pos/products.
    API_ENDPOINTS.products.create,
    payload,
  )
  return response.data
}

export async function updateProduct(productId: number, payload: UpdateProductRequest) {
  const response = await axiosClient.put<Product>(
    API_ENDPOINTS.products.detail(productId),
    payload,
  )
  return response.data
}

export async function deleteProduct(productId: number) {
  await axiosClient.delete(API_ENDPOINTS.products.detail(productId))
}
