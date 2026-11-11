import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'
import type { Product } from '@/types/product'

import {
  adjustProductStock,
  createProduct,
  getAdminProductPage,
  getSuperAdminProductPage,
  productToUpdateRequest,
  setProductActive,
} from './product.api'

vi.mock('@/services/http/axios-client', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const http = vi.mocked(axiosClient)

const product: Product = {
  id: 5,
  branchId: 3,
  name: 'Nuoc suoi',
  unit: 'chai',
  category: 'Drinks',
  price: 10000,
  active: true,
  stockQuantity: 24,
  imageUrl: 'https://cdn.example.com/water.png',
}

describe('product api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists every branch through the super admin endpoint', async () => {
    http.get.mockResolvedValue({ data: { items: [product], page: 0, size: 20, total: 1 } })
    const page = await getSuperAdminProductPage({ page: 0, size: 20 })
    expect(http.get).toHaveBeenCalledWith('/super-admin/pos/products', { params: { page: 0, size: 20 } })
    expect(page.content).toEqual([product])
  })

  it('maps { items, page, size, total } and sends only the filters that are set', async () => {
    http.get.mockResolvedValue({ data: { items: [product], page: 1, size: 20, total: 45 } })
    const page = await getAdminProductPage({ branchId: 3, page: 1, size: 20, query: ' nuoc ', active: false })
    expect(http.get).toHaveBeenCalledWith('/admin/pos/products', {
      params: { branchId: 3, page: 1, size: 20, query: 'nuoc', active: false },
    })
    expect(page).toMatchObject({ content: [product], number: 1, totalElements: 45, totalPages: 3, last: false })

    http.get.mockResolvedValue({ data: { items: [], page: 0, size: 20, total: 0 } })
    await getAdminProductPage({ branchId: 3, page: 0, size: 20, query: '  ' })
    expect(http.get).toHaveBeenLastCalledWith('/admin/pos/products', { params: { branchId: 3, page: 0, size: 20 } })
  })

  it('posts a new product with an Idempotency-Key', async () => {
    http.post.mockResolvedValue({ data: product })
    const payload = {
      branchId: 3,
      name: 'Nuoc suoi',
      unit: 'chai',
      category: 'Drinks',
      price: 10000,
      stockQuantity: 24,
      imageUrl: null,
    }
    await createProduct(payload, 'key-1')
    expect(http.post).toHaveBeenCalledWith('/admin/pos/products', payload, { headers: { 'Idempotency-Key': 'key-1' } })
  })

  it('stops selling with a PUT that keeps every other field', async () => {
    http.put.mockResolvedValue({ data: { ...product, active: false } })
    await setProductActive(product, false, 'key-2')
    expect(http.put).toHaveBeenCalledWith(
      '/admin/pos/products/5',
      productToUpdateRequest(product, false),
      { headers: { 'Idempotency-Key': 'key-2' } },
    )
    expect(productToUpdateRequest(product, false)).toEqual({
      name: 'Nuoc suoi',
      unit: 'chai',
      category: 'Drinks',
      price: 10000,
      active: false,
      imageUrl: 'https://cdn.example.com/water.png',
    })
  })

  it('posts a stock adjustment to the product', async () => {
    http.post.mockResolvedValue({ data: { ...product, stockQuantity: 20 } })
    const updated = await adjustProductStock(5, { delta: -4, reason: 'Hong' }, 'key-3')
    expect(http.post).toHaveBeenCalledWith(
      '/admin/pos/products/5/stock-adjustments',
      { delta: -4, reason: 'Hong' },
      { headers: { 'Idempotency-Key': 'key-3' } },
    )
    expect(updated.stockQuantity).toBe(20)
  })
})
