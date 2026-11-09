export type CourtLockType = 'OUT_OF_SERVICE' | 'PRIVATE_EVENT'

/** LockResponse of facility-service. `startAt` and `endAt` are venue-local "yyyy-MM-ddTHH:mm:ss". */
export interface CourtLock {
  id: number
  groupId: string | null
  branchId: number
  courtId: number
  type: CourtLockType
  startAt: string
  endAt: string
  reason: string
  notes: string | null
  publicReason: string | null
  contactName: string | null
  contactPhone: string | null
  createdBy: number
  createdAt: string
}

export interface LockDetailsRequest {
  startAt: string
  endAt: string
  type?: CourtLockType
  reason: string
  notes?: string
  publicReason?: string
  contactName?: string
  contactPhone?: string
}

/** POST /admin/courts/lock-slots (one court). */
export interface LockSlotsRequest extends LockDetailsRequest {
  courtId: number
}

/** POST /admin/courts/out-of-service: every court (`allCourts`) or a list of them, of one branch. */
export interface BranchLockRequest extends LockDetailsRequest {
  branchId: number
  allCourts?: boolean
  courtIds?: number[]
}

export interface CourtLockGroup {
  groupId: string
  branchId: number
  totalLocks: number
  locks: CourtLock[]
}

export interface CourtLockListParams {
  branchId: number
  courtId?: number
  from?: string
  to?: string
}
