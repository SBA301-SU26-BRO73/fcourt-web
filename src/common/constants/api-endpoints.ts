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
  vouchers: '/vouchers',
  bookings: '/bookings',
  payments: '/payments',
  superAdminDashboard: '/super-admin/dashboard',
  subscriptions: '/subscriptions',
  adminDashboard: '/admin/dashboard',
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
    me: joinEndpoint(API_PREFIXES.staff, 'me'),
    detail: (id: number) => joinEndpoint(API_PREFIXES.staff, id),
    create: joinEndpoint(API_PREFIXES.staff),
    update: (id: number) => joinEndpoint(API_PREFIXES.staff, id),
    delete: (id: number) => joinEndpoint(API_PREFIXES.staff, id),
    schedule: joinEndpoint(API_PREFIXES.staff, 'schedule'),
    courtBoard: joinEndpoint(API_PREFIXES.staff, 'court-board'),
    checkin: joinEndpoint(API_PREFIXES.staff, 'checkin'),
    walkInBooking: joinEndpoint(API_PREFIXES.staff, 'walk-in-bookings'),
    checkout: joinEndpoint(API_PREFIXES.staff, 'checkout'),
    posProducts: joinEndpoint(API_PREFIXES.staff, 'products'),
    posOrders: joinEndpoint(API_PREFIXES.staff, 'orders'),
    posOrderConfirm: (id: number) => joinEndpoint(API_PREFIXES.staff, 'orders', id, 'confirm'),
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
  vouchers: {
    list: joinEndpoint(API_PREFIXES.vouchers),
    detail: (id: string | number) => joinEndpoint(API_PREFIXES.vouchers, id),
    code: (code: string) => joinEndpoint(API_PREFIXES.vouchers, 'code', code),
  },
  bookings: {
    list: joinEndpoint(API_PREFIXES.bookings),
    my: joinEndpoint(API_PREFIXES.bookings, 'my'),
    lookup: joinEndpoint(API_PREFIXES.bookings, 'lookup'),
    revenue: joinEndpoint(API_PREFIXES.bookings, 'revenue'),
  },
  payments: {
    list: joinEndpoint(API_PREFIXES.payments),
    detail: (id: string | number) => joinEndpoint(API_PREFIXES.payments, id),
  },
  subscriptions: {
    plans: joinEndpoint(API_PREFIXES.subscriptions, 'plans'),
    mySubscription: joinEndpoint(API_PREFIXES.subscriptions, 'my-subscription'),
    checkout: joinEndpoint(API_PREFIXES.subscriptions, 'checkout'),
    payment: (orderCode: string | number) => joinEndpoint(API_PREFIXES.subscriptions, 'payments', orderCode),
  },
  superAdminDashboard: {
    stats: joinEndpoint(API_PREFIXES.superAdminDashboard, 'stats'),
    details: joinEndpoint(API_PREFIXES.superAdminDashboard, 'details'),
  },
  adminDashboard: {
    stats: joinEndpoint(API_PREFIXES.adminDashboard, 'stats'),
  },
} as const
