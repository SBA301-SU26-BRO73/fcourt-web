import { describe, expect, it } from 'vitest'

import type { Product } from '@/types/product'

import {
  emptyProductFormValues,
  productToFormValues,
  toCreateProductPayload,
  toStockAdjustmentPayload,
  toUpdateProductPayload,
  validateProductForm,
  validateStockAdjustment,
  type ProductFormValues,
} from './product-form.utils'

const valid: ProductFormValues = {
  ...emptyProductFormValues,
  branchId: '3',
  name: ' Nuoc suoi ',
  unit: 'chai',
  category: 'Drinks',
  price: '10000',
  stockQuantity: '24',
  imageUrl: 'https://cdn.example.com/water.png',
}

const product: Product = {
  id: 5,
  branchId: 3,
  name: 'Nuoc suoi',
  unit: null,
  category: 'Drinks',
  price: 10000,
  active: false,
  stockQuantity: 24,
  imageUrl: null,
}

describe('validateProductForm', () => {
  it('accepts a complete form', () => {
    expect(validateProductForm(valid)).toEqual({})
  })

  it('needs branch, name, category and a positive price', () => {
    const errors = validateProductForm({ ...valid, branchId: '', name: ' ', category: '', price: '0' })
    expect(Object.keys(errors).sort()).toEqual(['branchId', 'category', 'name', 'price'])
  })

  it('only takes an https image url, or none', () => {
    expect(validateProductForm({ ...valid, imageUrl: 'http://x.com/a.png' }).imageUrl).toBeTruthy()
    expect(validateProductForm({ ...valid, imageUrl: 'https://x.com/a b.png' }).imageUrl).toBeTruthy()
    expect(validateProductForm({ ...valid, imageUrl: '' })).toEqual({})
  })

  it('checks the opening stock on create but ignores branch and stock on edit', () => {
    expect(validateProductForm({ ...valid, stockQuantity: '-1' }).stockQuantity).toBeTruthy()
    expect(validateProductForm({ ...valid, stockQuantity: '1.5' }).stockQuantity).toBeTruthy()
    expect(validateProductForm({ ...valid, branchId: '', stockQuantity: '-1' }, true)).toEqual({})
  })
})

describe('product payloads', () => {
  it('builds a create request with the branch and opening stock', () => {
    expect(toCreateProductPayload(valid)).toEqual({
      branchId: 3,
      name: 'Nuoc suoi',
      unit: 'chai',
      category: 'Drinks',
      price: 10000,
      stockQuantity: 24,
      imageUrl: 'https://cdn.example.com/water.png',
    })
  })

  it('builds a full update with active and null for blanks', () => {
    expect(toUpdateProductPayload({ ...productToFormValues(product), active: true })).toEqual({
      name: 'Nuoc suoi',
      unit: null,
      category: 'Drinks',
      price: 10000,
      active: true,
      imageUrl: null,
    })
  })
})

describe('stock adjustment', () => {
  it('needs a non-zero integer and a reason', () => {
    expect(validateStockAdjustment({ delta: '5', reason: 'Nhap them' }, 10)).toBeNull()
    expect(validateStockAdjustment({ delta: '', reason: 'x' }, 10)).toBeTruthy()
    expect(validateStockAdjustment({ delta: '0', reason: 'x' }, 10)).toBeTruthy()
    expect(validateStockAdjustment({ delta: '1.5', reason: 'x' }, 10)).toBeTruthy()
    expect(validateStockAdjustment({ delta: '5', reason: ' ' }, 10)).toBeTruthy()
  })

  it('does not let the stock go below zero', () => {
    expect(validateStockAdjustment({ delta: '-10', reason: 'Hong' }, 10)).toBeNull()
    expect(validateStockAdjustment({ delta: '-11', reason: 'Hong' }, 10)).toBeTruthy()
  })

  it('sends a number and a trimmed reason', () => {
    expect(toStockAdjustmentPayload({ delta: '-3', reason: ' Hong ' })).toEqual({ delta: -3, reason: 'Hong' })
  })
})
