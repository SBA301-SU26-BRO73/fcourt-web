import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiResponse, LoginRequest, TokenResponse } from '@/types/auth'

import { useLogin } from './use-auth'

const navigate = vi.fn()
const setAuth = vi.fn()
const loginMock = vi.fn()
const decodeJwtMock = vi.fn()
const useMutationMock = vi.fn((options) => options)

vi.mock('@tanstack/react-query', () => ({
  useMutation: (options: unknown) => useMutationMock(options),
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
}))

vi.mock('@/hooks/use-auth-context', () => ({
  useAuth: () => ({ setAuth }),
}))

vi.mock('@/services/auth/auth.service', () => ({
  login: (...args: unknown[]) => loginMock(...args),
  registerCourtOwner: vi.fn(),
  registerCustomer: vi.fn(),
}))

vi.mock('@/utils/token', () => ({
  decodeJwt: (...args: unknown[]) => decodeJwtMock(...args),
}))

const tokens: TokenResponse = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresIn: 123,
}

interface CapturedLoginMutation {
  mutationFn: (data: LoginRequest) => Promise<ApiResponse<TokenResponse>>
  onSuccess: (response: ApiResponse<TokenResponse>) => void
}

function captureLoginMutation() {
  return useLogin() as unknown as CapturedLoginMutation
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the auth login service as its mutation function', async () => {
    const response = { data: tokens }
    loginMock.mockResolvedValueOnce(response)

    const mutation = captureLoginMutation()

    await expect(
      mutation.mutationFn({ email: 'user@example.com', password: 'secret' }),
    ).resolves.toBe(response)
    expect(loginMock).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret' })
  })

  it.each([
    ['SUPER_ADMIN', '/super-admin'],
    ['ADMIN', '/admin/branches'],
    ['STAFF', '/staff'],
    ['CUSTOMER', '/'],
  ] as const)('stores tokens and navigates %s users to %s', (role, route) => {
    decodeJwtMock.mockReturnValueOnce({
      id: 1,
      email: 'user@example.com',
      role,
    })

    const mutation = captureLoginMutation()
    mutation.onSuccess({ data: tokens })

    expect(setAuth).toHaveBeenCalledWith(tokens)
    expect(decodeJwtMock).toHaveBeenCalledWith(tokens.accessToken)
    expect(navigate).toHaveBeenCalledWith(route)
  })

  it('does nothing when login response has no token data', () => {
    const mutation = captureLoginMutation()

    mutation.onSuccess({ message: 'Missing token' })

    expect(setAuth).not.toHaveBeenCalled()
    expect(decodeJwtMock).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('keeps login errors rejected from the mutation function', async () => {
    const error = new Error('Email hoặc mật khẩu không đúng')
    loginMock.mockRejectedValueOnce(error)

    const mutation = captureLoginMutation()

    await expect(
      mutation.mutationFn({ email: 'user@example.com', password: 'bad' }),
    ).rejects.toThrow('Email hoặc mật khẩu không đúng')
    expect(setAuth).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})
