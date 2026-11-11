import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/use-auth-context'
import {
  forgotPassword,
  googleLogin,
  login,
  registerCourtOwner,
  registerCustomer,
  resetPassword,
} from '@/services/auth/auth.service'
import type { LoginRequest, RegisterCustomerRequest, TokenResponse, UserRole } from '@/types/auth'
import { readLoginRedirect } from '@/utils/redirect'
import { decodeJwt } from '@/utils/token'

/** Where each backend role lands after signing in. */
export const ROLE_HOME_PATH: Record<UserRole, string> = {
  SUPER_ADMIN: '/super-admin',
  ADMIN: '/admin/branches',
  STAFF: '/staff',
  CUSTOMER: '/',
}

function landingPath(tokens: TokenResponse) {
  const role = decodeJwt(tokens.accessToken).role
  return readLoginRedirect(role, ROLE_HOME_PATH[role])
}

export function useLogin() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (tokens: TokenResponse) => {
      setAuth(tokens)
      navigate(landingPath(tokens))
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

export function useGoogleLogin() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()

  return useMutation({
    mutationFn: (idToken: string) => googleLogin(idToken),
    onSuccess: (tokens: TokenResponse) => {
      setAuth(tokens)
      navigate(landingPath(tokens))
    },
  })
}

export function useForgotPassword() {
  return useMutation({ mutationFn: (email: string) => forgotPassword(email) })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) => resetPassword(token, newPassword),
  })
}
