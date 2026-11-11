/** pos-retail-service `PosViews.Product`. */
export interface Product {
  id: number
  branchId: number
  name: string
  unit: string | null
  category: string
  price: number
  active: boolean
  stockQuantity: number
  imageUrl: string | null
}

/** POST /admin/pos/products. `imageUrl` must be an https URL when given. */
export interface CreateProductRequest {
  branchId: number
  name: string
  unit: string | null
  category: string
  price: number
  stockQuantity: number
  imageUrl: string | null
}

/** PUT /admin/pos/products/{id}: a full replacement, `active` is required. */
export interface UpdateProductRequest {
  name: string
  unit: string | null
  category: string
  price: number
  active: boolean
  imageUrl: string | null
}

/** POST /admin/pos/products/{id}/stock-adjustments: `delta` is non-zero, may be negative. */
export interface StockAdjustmentRequest {
  delta: number
  reason: string
}

/** `{ items, page, size, total }` returned by GET /admin/pos/products. */
export interface ProductApiPage {
  items: Product[]
  page: number
  size: number
  total: number
}

export interface ProductListParams {
  branchId: number
  page: number
  size: number
  query?: string
  /** Leave out to get active and inactive products. */
  active?: boolean
}
