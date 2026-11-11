import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { axiosClient } from '@/services/http/axios-client'
import { SuperAdminProductsPage } from './products-page'

vi.mock('@/services/http/axios-client', () => ({ axiosClient: { get: vi.fn() } }))

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

describe('SuperAdminProductsPage', () => {
  it('loads all branches and sends the selected branch, resetting pagination on filter changes', async () => {
    const get = vi.mocked(axiosClient.get)
    get.mockResolvedValue({
      data: {
        items: [{ id: 5, branchId: 3, name: 'Nước suối', price: 10000, active: true }],
        page: 0, size: 20, total: 45,
      },
    })
    get.mockResolvedValueOnce({ data: [{ id: 3, name: 'Chi nhánh A' }, { id: 4, name: 'Chi nhánh B' }] })

    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
    render(<QueryClientProvider client={client}><SuperAdminProductsPage /></QueryClientProvider>)

    await screen.findByRole('option', { name: 'Chi nhánh B' })
    await screen.findByText('Nước suối')
    expect(get).toHaveBeenCalledWith('/admin/branches')
    expect(get).toHaveBeenCalledWith('/super-admin/pos/products', { params: { page: 0, size: 20 } })
    expect(screen.getByRole('cell', { name: 'Chi nhánh A' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Sau' }))
    await waitFor(() => expect(get).toHaveBeenCalledWith('/super-admin/pos/products', { params: { page: 1, size: 20 } }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Chi nhánh' }), { target: { value: '4' } })
    await waitFor(() => expect(get).toHaveBeenLastCalledWith('/super-admin/pos/products', {
      params: { branchId: 4, page: 0, size: 20 },
    }))
    expect(screen.getByText('Trang 1 / 3')).toBeTruthy()

    fireEvent.change(screen.getByRole('combobox', { name: 'Chi nhánh' }), { target: { value: '' } })
    await waitFor(() => expect(get).toHaveBeenLastCalledWith('/super-admin/pos/products', { params: { page: 0, size: 20 } }))
    expect(screen.getByRole('option', { name: 'Tất cả chi nhánh' })).toBeTruthy()
    client.clear()
  })
})
