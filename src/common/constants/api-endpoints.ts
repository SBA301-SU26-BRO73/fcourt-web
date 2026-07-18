export const API_PREFIXES = {
  auth: '/auth',
  users: '/users',
  products: '/products',
  orders: '/orders',
  categories: '/categories',
  staff: '/v1/staff',
  staffBranches: '/v1/branches', // StaffController: /api/v1/branches/{id}/staff
  courtTypes: '/court-types',
  plans: '/subscription-plans',
  branches: '/branches',         // BranchController: /api/branches
  courts: '/courts',             // CourtController: /api/courts
  timeSlotTemplates: '/time-slot-templates',
} as const

function joinEndpoint(...segments: Array<string | number>) {
  return segments
    .map((segment) => String(segment).replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')
    .replace(/^/, '/')
}

export const API_ENDPOINTS = {
  auth: {
    login: joinEndpoint(API_PREFIXES.auth, 'login'),
    register: joinEndpoint(API_PREFIXES.auth, 'register'),
    profile: joinEndpoint(API_PREFIXES.auth, 'profile'),
    registerCustomer: joinEndpoint(API_PREFIXES.auth, 'register/customer'),
    registerCourtOwner: joinEndpoint(API_PREFIXES.auth, 'register/court-owner'),
    refresh: joinEndpoint(API_PREFIXES.auth, 'refresh'),
  },
  users: {
    list: joinEndpoint(API_PREFIXES.users),
    detail: (id: string | number) => joinEndpoint(API_PREFIXES.users, id),
    approve: (id: string | number) => joinEndpoint(API_PREFIXES.users, id, 'approve'),
    reject: (id: string | number) => joinEndpoint(API_PREFIXES.users, id, 'reject'),
    lock: (id: string | number) => joinEndpoint(API_PREFIXES.users, id, 'lock'),
    unlock: (id: string | number) => joinEndpoint(API_PREFIXES.users, id, 'unlock'),
  },
  courtTypes: {
    list: joinEndpoint(API_PREFIXES.courtTypes),
    detail: (id: string | number) => joinEndpoint(API_PREFIXES.courtTypes, id),
    update: (id: string | number) => joinEndpoint(API_PREFIXES.courtTypes, id),
    delete: (id: string | number) => joinEndpoint(API_PREFIXES.courtTypes, id),
  },
  plans: {
    list: joinEndpoint(API_PREFIXES.plans),
    detail: (id: string | number) => joinEndpoint(API_PREFIXES.plans, id),
    update: (id: string | number) => joinEndpoint(API_PREFIXES.plans, id),
    delete: (id: string | number) => joinEndpoint(API_PREFIXES.plans, id),
  },
  products: {
    list: joinEndpoint(API_PREFIXES.products),
    detail: (id: string | number) => joinEndpoint(API_PREFIXES.products, id),
  },
  orders: {
    list: joinEndpoint(API_PREFIXES.orders),
    detail: (id: string | number) => joinEndpoint(API_PREFIXES.orders, id),
  },
  categories: {
    list: joinEndpoint(API_PREFIXES.categories),
  },
  staff: {
    listByBranch: (branchId: number) =>
      joinEndpoint(API_PREFIXES.staffBranches, branchId, 'staff'),
    detail: (id: number) => joinEndpoint(API_PREFIXES.staff, id),
    create: joinEndpoint(API_PREFIXES.staff),
    update: (id: number) => joinEndpoint(API_PREFIXES.staff, id),
    delete: (id: number) => joinEndpoint(API_PREFIXES.staff, id),
    schedule: joinEndpoint(API_PREFIXES.staff, 'schedule'),
    checkin: joinEndpoint(API_PREFIXES.staff, 'checkin'),
    walkInBooking: joinEndpoint(API_PREFIXES.staff, 'walk-in-bookings'),
    checkout: joinEndpoint(API_PREFIXES.staff, 'checkout'),
  },
  branches: {
    list: joinEndpoint(API_PREFIXES.branches),
    detail: (id: string | number) => joinEndpoint(API_PREFIXES.branches, id),
  },
  courts: {
    list: joinEndpoint(API_PREFIXES.courts),
    detail: (id: string | number) => joinEndpoint(API_PREFIXES.courts, id),
  },
  timeSlotTemplates: {
    list: joinEndpoint(API_PREFIXES.timeSlotTemplates),
    detail: (id: string | number) => joinEndpoint(API_PREFIXES.timeSlotTemplates, id),
    byCourt: (courtId: string | number) =>
      joinEndpoint(API_PREFIXES.timeSlotTemplates, 'court', courtId),
    apply: (targetCourtId: string | number) =>
      joinEndpoint(API_PREFIXES.timeSlotTemplates, 'apply', targetCourtId),
  },
} as const
