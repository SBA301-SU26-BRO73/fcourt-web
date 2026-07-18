import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/use-auth-context'
import { login, registerCourtOwner, registerCustomer } from '@/services/auth/auth.service'
import type { LoginRequest, RegisterCustomerRequest } from '@/types/auth'
import { decodeJwt } from '@/utils/token'

export function useLogin() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (res) => {
      if (res.data) {
        setAuth(res.data)
        const decoded = decodeJwt(res.data.accessToken)
        if (decoded.role === 'SUPER_ADMIN') {
          navigate('/super-admin')
        } else if (decoded.role === 'ADMIN') {
          navigate('/admin/branches')
        } else {
          navigate('/')
        }
      }
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
