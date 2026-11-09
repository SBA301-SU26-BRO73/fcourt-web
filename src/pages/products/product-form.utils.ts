import type {
  CreateProductRequest,
  Product,
  StockAdjustmentRequest,
  UpdateProductRequest,
} from '@/types/product'

export interface ProductFormValues {
  branchId: string
  name: string
  unit: string
  category: string
  price: string
  stockQuantity: string
  imageUrl: string
  active: boolean
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>

export const emptyProductFormValues: ProductFormValues = {
  branchId: '',
  name: '',
  unit: '',
  category: '',
  price: '',
  stockQuantity: '0',
  imageUrl: '',
  active: true,
}

export const MAX_STOCK = 1_000_000_000
const HTTPS_URL_RE = /^https:\/\/\S+$/

export function productToFormValues(product: Product): ProductFormValues {
  return {
    branchId: String(product.branchId),
    name: product.name,
    unit: product.unit ?? '',
    category: product.category,
    price: String(product.price),
    stockQuantity: String(product.stockQuantity),
    imageUrl: product.imageUrl ?? '',
    active: product.active,
  }
}

/** `isEdit` skips the branch and the opening stock, which the update cannot change. */
export function validateProductForm(values: ProductFormValues, isEdit = false): ProductFormErrors {
  const errors: ProductFormErrors = {}
  const branchId = Number(values.branchId)
  const price = Number(values.price)
  const stock = Number(values.stockQuantity)

  if (!isEdit && (!values.branchId || !Number.isInteger(branchId) || branchId <= 0)) {
    errors.branchId = 'Vui lòng chọn chi nhánh.'
  }
  if (!values.name.trim()) {
    errors.name = 'Vui lòng nhập tên sản phẩm.'
  } else if (values.name.trim().length > 150) {
    errors.name = 'Tối đa 150 ký tự.'
  }
  if (values.unit.trim().length > 30) {
    errors.unit = 'Tối đa 30 ký tự.'
  }
  if (!values.category.trim()) {
    errors.category = 'Vui lòng nhập nhóm sản phẩm.'
  } else if (values.category.trim().length > 60) {
    errors.category = 'Tối đa 60 ký tự.'
  }
  if (!values.price.trim() || Number.isNaN(price) || price < 0.01) {
    errors.price = 'Giá bán phải lớn hơn 0.'
  } else if (price >= 100_000_000) {
    errors.price = 'Giá bán quá lớn.'
  }
  if (!isEdit && (!Number.isInteger(stock) || stock < 0 || stock > MAX_STOCK)) {
    errors.stockQuantity = 'Tồn kho phải là số nguyên không âm.'
  }
  const imageUrl = values.imageUrl.trim()
  if (imageUrl && (!HTTPS_URL_RE.test(imageUrl) || imageUrl.length > 2000)) {
    errors.imageUrl = 'Ảnh phải là đường dẫn bắt đầu bằng https://.'
  }

  return errors
}

function nullable(value: string) {
  return value.trim() || null
}

export function toCreateProductPayload(values: ProductFormValues): CreateProductRequest {
  return {
    branchId: Number(values.branchId),
    name: values.name.trim(),
    unit: nullable(values.unit),
    category: values.category.trim(),
    price: Number(values.price),
    stockQuantity: Number(values.stockQuantity),
    imageUrl: nullable(values.imageUrl),
  }
}

export function toUpdateProductPayload(values: ProductFormValues): UpdateProductRequest {
  return {
    name: values.name.trim(),
    unit: nullable(values.unit),
    category: values.category.trim(),
    price: Number(values.price),
    active: values.active,
    imageUrl: nullable(values.imageUrl),
  }
}

export interface StockAdjustmentValues {
  delta: string
  reason: string
}

/** Message for the first problem, or null. `current` is the stock before the change. */
export function validateStockAdjustment(values: StockAdjustmentValues, current: number): string | null {
  const delta = Number(values.delta)
  if (!values.delta.trim() || !Number.isInteger(delta)) return 'Nhập số lượng thay đổi là số nguyên.'
  if (delta === 0) return 'Số lượng thay đổi phải khác 0.'
  if (current + delta < 0) return 'Tồn kho không thể âm sau khi điều chỉnh.'
  if (current + delta > MAX_STOCK) return 'Tồn kho vượt giới hạn cho phép.'
  if (!values.reason.trim()) return 'Nhập lý do điều chỉnh.'
  if (values.reason.trim().length > 500) return 'Lý do tối đa 500 ký tự.'
  return null
}

export function toStockAdjustmentPayload(values: StockAdjustmentValues): StockAdjustmentRequest {
  return { delta: Number(values.delta), reason: values.reason.trim() }
}
