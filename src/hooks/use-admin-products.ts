import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  adjustProductStock,
  createProduct,
  getAdminProductPage,
  setProductActive,
  updateProduct,
} from '@/services/product/product.api'
import type {
  CreateProductRequest,
  Product,
  ProductListParams,
  StockAdjustmentRequest,
  UpdateProductRequest,
} from '@/types/product'

const KEY = ['products'] as const

export function useAdminProducts(params: ProductListParams | null) {
  return useQuery({
    queryKey: [...KEY, 'admin-list', params],
    queryFn: () => getAdminProductPage(params as ProductListParams),
    placeholderData: keepPreviousData,
    enabled: params !== null,
  })
}

export function useSaveProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { id?: number; payload: CreateProductRequest | UpdateProductRequest; key: string }) =>
      input.id
        ? updateProduct(input.id, input.payload as UpdateProductRequest, input.key)
        : createProduct(input.payload as CreateProductRequest, input.key),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useSetProductActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ product, active }: { product: Product; active: boolean }) => setProductActive(product, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useAdjustStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload, key }: { id: number; payload: StockAdjustmentRequest; key: string }) =>
      adjustProductStock(id, payload, key),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
