import type {
  CreateProductRequest,
  Product,
  UpdateProductRequest,
} from '@/types/product'

export interface ProductFormValues {
  branchId: string
  name: string
  unit: string
  price: string
  active: boolean
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>

export const emptyProductFormValues: ProductFormValues = {
  branchId: '',
  name: '',
  unit: '',
  price: '',
  active: true,
}

export function productToFormValues(product: Product): ProductFormValues {
  return {
    branchId: String(product.branchId),
    name: product.name,
    unit: product.unit ?? '',
    price: String(product.price),
    active: product.active,
  }
}

export function validateProductForm(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {}
  const branchId = Number(values.branchId)
  const price = Number(values.price)

  if (!values.branchId || !Number.isInteger(branchId) || branchId <= 0) {
    errors.branchId = 'Branch is required.'
  }
  if (!values.name.trim()) {
    errors.name = 'Product name is required.'
  } else if (values.name.trim().length > 150) {
    errors.name = 'Maximum 150 characters.'
  }
  if (values.unit.trim().length > 30) {
    errors.unit = 'Maximum 30 characters.'
  }
  if (!values.price.trim() || Number.isNaN(price) || price <= 0) {
    errors.price = 'Price must be greater than zero.'
  }

  return errors
}

function nullable(value: string) {
  return value.trim() || null
}

export function toCreateProductPayload(values: ProductFormValues): CreateProductRequest {
  return {
    name: values.name.trim(),
    unit: nullable(values.unit),
    price: Number(values.price),
    active: values.active,
  }
}

export function toUpdateProductPayload(values: ProductFormValues): UpdateProductRequest {
  return {
    name: values.name.trim(),
    unit: values.unit.trim(),
    price: Number(values.price),
    active: values.active,
  }
}
