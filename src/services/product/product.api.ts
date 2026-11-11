import { API_ENDPOINTS } from '@/common/constants/api-endpoints'
import { pageFromApi } from '@/common/utils/api-page'
import { newIdempotencyKey } from '@/services/booking/booking.api'
import { axiosClient } from '@/services/http/axios-client'
import type {
  CreateProductRequest,
  Product,
  ProductApiPage,
  ProductListParams,
  StockAdjustmentRequest,
  UpdateProductRequest,
} from '@/types/product'

/** Owner list: `GET /admin/pos/products?branchId&active&query&page&size` answers `{ items, page, size, total }`. */
export async function getAdminProductPage(params: ProductListParams) {
  const { data } = await axiosClient.get<ProductApiPage>(API_ENDPOINTS.products.adminList, {
    params: {
      branchId: params.branchId,
      page: params.page,
      size: params.size,
      ...(params.query?.trim() ? { query: params.query.trim() } : {}),
      ...(params.active === undefined ? {} : { active: params.active }),
    },
  })
  return pageFromApi(data)
}

/** Super admin list over every branch: `GET /super-admin/pos/products?branchId&active&query&page&size`. */
export async function getSuperAdminProductPage(params: Omit<ProductListParams, 'branchId'> & { branchId?: number }) {
  const { data } = await axiosClient.get<ProductApiPage>(API_ENDPOINTS.products.superAdminList, {
    params: {
      page: params.page,
      size: params.size,
      ...(params.branchId ? { branchId: params.branchId } : {}),
      ...(params.query?.trim() ? { query: params.query.trim() } : {}),
      ...(params.active === undefined ? {} : { active: params.active }),
    },
  })
  return pageFromApi(data)
}

/** Write calls need an Idempotency-Key; a retry of the same attempt must reuse the key. */
export async function createProduct(payload: CreateProductRequest, idempotencyKey: string = newIdempotencyKey()) {
  const { data } = await axiosClient.post<Product>(API_ENDPOINTS.products.create, payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return data
}

export async function updateProduct(
  productId: number,
  payload: UpdateProductRequest,
  idempotencyKey: string = newIdempotencyKey(),
) {
  const { data } = await axiosClient.put<Product>(API_ENDPOINTS.products.detail(productId), payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return data
}

/** The update that leaves the product as it is, optionally with another `active` flag. */
export function productToUpdateRequest(product: Product, active: boolean = product.active): UpdateProductRequest {
  return {
    name: product.name,
    unit: product.unit,
    category: product.category,
    price: product.price,
    active,
    imageUrl: product.imageUrl,
  }
}

/** There is no DELETE: stopping sale (and selling again) is a PUT with the `active` flag. */
export function setProductActive(product: Product, active: boolean, idempotencyKey?: string) {
  return updateProduct(product.id, productToUpdateRequest(product, active), idempotencyKey)
}

/** `delta` is added to the stock (negative removes); the answer is the updated product. */
export async function adjustProductStock(
  productId: number,
  payload: StockAdjustmentRequest,
  idempotencyKey: string = newIdempotencyKey(),
) {
  const { data } = await axiosClient.post<Product>(API_ENDPOINTS.products.stockAdjustments(productId), payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return data
}
