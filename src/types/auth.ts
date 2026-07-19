export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'STAFF'

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface ApiResponse<T> {
  httpStatus?: number
  data?: T
  message?: string
  errorCode?: string
}

export interface AuthUser {
  id: number
  email: string
  role: UserRole
}

export type UserStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE' | 'LOCKED'

export interface UserProfile extends AuthUser {
  fullName: string | null
  phone: string | null
  status: UserStatus
}

export interface UpdateProfileRequest {
  fullName: string
  phone: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterCustomerRequest {
  fullName: string
  email: string
  phone: string
  password: string
}
