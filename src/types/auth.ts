export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'STAFF'

export const USER_ROLES: readonly UserRole[] = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN', 'STAFF']

export type UserStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'REJECTED'

/** `user` object returned by login, register and refresh (auth-service `UserResponse`). */
export interface AuthResponseUser {
  id: number
  email: string
  fullName: string | null
  phone: string | null
  role: UserRole
  status: UserStatus
  createdAt?: string
  avatarUrl?: string | null
}

/** auth-service `AuthResponse`: returned at the JSON root, `expiresIn` is in seconds. */
export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType?: string
  /** Access token lifetime in seconds (OAuth 2.0 `expires_in`), not an epoch timestamp. */
  expiresIn: number
  user?: AuthResponseUser
}

export interface AuthUser {
  id: number
  /** Not in the JWT any more; filled from the auth response or GET /auth/profile. */
  email: string
  role: UserRole
  fullName?: string | null
}

export interface UserProfile extends AuthUser {
  fullName: string | null
  avatarUrl?: string | null
  phone: string | null
  status: UserStatus
}

export interface UpdateProfileRequest {
  fullName: string
  phone: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
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

/** Response of POST /auth/register/court-owner: the account waits for super admin approval. */
export interface RegisterCourtOwnerResponse {
  id: number
  status: UserStatus
  message: string
}
