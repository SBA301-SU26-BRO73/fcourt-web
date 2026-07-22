export interface Product {
  id: number
  branchId: number
  branchName: string
  name: string
  unit: string | null
  price: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductRequest {
  name: string
  unit?: string | null
  price: number
  active?: boolean | null
}

export interface UpdateProductRequest {
  name?: string | null
  unit?: string | null
  price?: number | null
  active?: boolean | null
}
