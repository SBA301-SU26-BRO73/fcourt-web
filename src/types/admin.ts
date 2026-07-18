import type { UserRole } from '@/types/auth'

export type UserStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'INACTIVE' | 'LOCKED'

export interface UserAdminItem {
  id: number
  email: string
  fullName: string | null
  phone: string | null
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface CourtTypeData {
  id: number
  name: string
  nameEn: string | null
  description: string | null
  icon: string | null
  color: string | null
  active: boolean
  createdAt: string
}

export interface CourtTypeRequest {
  name: string
  nameEn?: string
  description?: string
  icon?: string
  color?: string
  active: boolean
}

export interface PlanData {
  id: number
  name: string
  tagline: string | null
  monthlyPrice: number | null
  yearlyPrice: number | null
  maxBranches: number
  maxCourts: number
  features: string[]
  color: string | null
  popular: boolean
  active: boolean
}

export interface PlanRequest {
  name: string
  tagline?: string
  monthlyPrice?: number
  yearlyPrice?: number
  maxBranches: number
  maxCourts: number
  features: string[]
  color?: string
  popular: boolean
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
