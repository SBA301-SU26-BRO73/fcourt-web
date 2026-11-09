import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/use-auth-context'
import { login, registerCourtOwner, registerCustomer } from '@/services/auth/auth.service'
import type { LoginRequest, RegisterCustomerRequest, TokenResponse, UserRole } from '@/types/auth'
import { decodeJwt } from '@/utils/token'

/** Where each backend role lands after signing in. */
export const ROLE_HOME_PATH: Record<UserRole, string> = {
  SUPER_ADMIN: '/super-admin',
  ADMIN: '/admin/branches',
  STAFF: '/staff',
  CUSTOMER: '/',
}

export function useLogin() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (tokens: TokenResponse) => {
      setAuth(tokens)
      navigate(ROLE_HOME_PATH[decodeJwt(tokens.accessToken).role])
    },
  })
}

export function useRegisterCustomer() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterCustomerRequest) => registerCustomer(data),
    onSuccess: () => {
      navigate('/auth/login?role=customer')
    },
  })
}

export function useRegisterCourtOwner(onSuccess: () => void) {
  return useMutation({
    mutationFn: (data: FormData) => registerCourtOwner(data),
    onSuccess,
  })
}
