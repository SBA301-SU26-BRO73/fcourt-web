/**
 * Paths are relative to VITE_API_URL (which ends with `/api`). Each path matches the
 * route in the microservice backend; TODO(Fx) marks calls whose contract still has to
 * be reworked in that work item of docs/api-gap-report.md (section 3.3).
 */
export const API_PREFIXES = {
  auth: '/auth',
  users: '/users', // TODO(F14): no "list all users" endpoint in the backend
  superAdmin: '/super-admin',
  courtTypes: '/court-types',
  plans: '/subscription-plans',
  subscriptions: '/subscriptions',
  publicBranches: '/public/branches',
  publicCourts: '/public/courts',
  adminBranches: '/admin/branches',
  adminCourts: '/admin/courts',
  adminTimeSlotTemplates: '/admin/time-slot-templates',
  adminVouchers: '/admin/vouchers',
  adminBookings: '/admin/bookings',
  adminPayments: '/admin/payments',
  adminRefunds: '/admin/refunds',
  adminStaff: '/admin/staff',
  adminPosProducts: '/admin/pos/products',
  adminDashboard: '/admin/dashboard',
  superAdminDashboard: '/super-admin/dashboard',
  bookings: '/bookings',
  staff: '/staff',
  staffPos: '/staff/pos',
} as const

function joinEndpoint(...segments: Array<string | number>) {
  return segments
    .map((segment) => String(segment).replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')
    .replace(/^/, '/')
}

type Id = string | number

export const API_ENDPOINTS = {
  auth: {
    login: joinEndpoint(API_PREFIXES.auth, 'login'),
    profile: joinEndpoint(API_PREFIXES.auth, 'profile'),
    changePassword: joinEndpoint(API_PREFIXES.auth, 'password'),
    forgotPassword: joinEndpoint(API_PREFIXES.auth, 'password/forgot'),
    resetPassword: joinEndpoint(API_PREFIXES.auth, 'password/reset'),
    google: joinEndpoint(API_PREFIXES.auth, 'google'),
    avatar: joinEndpoint(API_PREFIXES.auth, 'profile/avatar'),
    registerCustomer: joinEndpoint(API_PREFIXES.auth, 'register/customer'),
    registerCourtOwner: joinEndpoint(API_PREFIXES.auth, 'register/court-owner'),
    refresh: joinEndpoint(API_PREFIXES.auth, 'refresh'),
    logout: joinEndpoint(API_PREFIXES.auth, 'logout'),
  },
  users: {
    // TODO(F14): GET /users (all users with role/status filters) does not exist in the backend.
    list: joinEndpoint(API_PREFIXES.users),
    pending: joinEndpoint(API_PREFIXES.superAdmin, 'court-admins/pending'),
    detail: (id: Id) => joinEndpoint(API_PREFIXES.superAdmin, 'court-admins', id),
    approve: (id: Id) => joinEndpoint(API_PREFIXES.superAdmin, 'court-admins', id, 'approve'),
    reject: (id: Id) => joinEndpoint(API_PREFIXES.superAdmin, 'court-admins', id, 'reject'),
    // lock and unlock are merged into one toggle.
    toggleStatus: (id: Id) => joinEndpoint(API_PREFIXES.superAdmin, 'users', id, 'toggle-status'),
  },
  courtTypes: {
    list: joinEndpoint(API_PREFIXES.courtTypes),
    detail: (id: Id) => joinEndpoint(API_PREFIXES.courtTypes, id),
    update: (id: Id) => joinEndpoint(API_PREFIXES.courtTypes, id),
    delete: (id: Id) => joinEndpoint(API_PREFIXES.courtTypes, id),
  },
  plans: {
    list: joinEndpoint(API_PREFIXES.plans),
    all: joinEndpoint(API_PREFIXES.plans, 'all'),
    detail: (id: Id) => joinEndpoint(API_PREFIXES.plans, id),
    update: (id: Id) => joinEndpoint(API_PREFIXES.plans, id),
    delete: (id: Id) => joinEndpoint(API_PREFIXES.plans, id),
  },
  products: {
    // TODO(F11): there is no admin product list; the staff POS catalog is the only read endpoint.
    list: joinEndpoint(API_PREFIXES.staffPos, 'products'),
    // TODO(F11): the backend has no GET/DELETE product by id.
    detail: (id: Id) => joinEndpoint(API_PREFIXES.adminPosProducts, id),
    create: joinEndpoint(API_PREFIXES.adminPosProducts),
  },
  staff: {
    list: joinEndpoint(API_PREFIXES.adminStaff),
    // TODO(F11): GET staff by id does not exist in the backend (only /admin/staff/accounts/{userId}).
    detail: (id: Id) => joinEndpoint(API_PREFIXES.adminStaff, id),
    // TODO(F13): there is no court board endpoint; combine facility courts with public slots.
    courtBoard: joinEndpoint(API_PREFIXES.staff, 'court-board'),
    // TODO(F13): POS orders are created and settled in one call; there is no confirm step.
    posOrderConfirm: (id: Id) => joinEndpoint(API_PREFIXES.staffPos, 'orders', id, 'confirm'),
    me: joinEndpoint(API_PREFIXES.staff, 'me'),
    create: joinEndpoint(API_PREFIXES.adminStaff),
    update: (id: Id) => joinEndpoint(API_PREFIXES.adminStaff, id),
    delete: (id: Id) => joinEndpoint(API_PREFIXES.adminStaff, id),
    schedule: joinEndpoint(API_PREFIXES.staff, 'schedule'),
    checkinManual: joinEndpoint(API_PREFIXES.staff, 'check-in/manual'),
    walkInBooking: joinEndpoint(API_PREFIXES.staff, 'walk-in'),
    checkout: (bookingId: Id) => joinEndpoint(API_PREFIXES.staff, 'bookings', bookingId, 'checkout'),
    branchCourts: (branchId: Id) => joinEndpoint(API_PREFIXES.staff, 'branches', branchId, 'courts'),
    posProducts: joinEndpoint(API_PREFIXES.staffPos, 'products'),
    posOrders: joinEndpoint(API_PREFIXES.staffPos, 'orders'),
  },
  // Customer-facing branch/court discovery.
  branches: {
    list: joinEndpoint(API_PREFIXES.publicBranches),
    detail: (id: Id) => joinEndpoint(API_PREFIXES.publicBranches, id),
    courts: (id: Id) => joinEndpoint(API_PREFIXES.publicBranches, id, 'courts'),
    images: (id: Id) => joinEndpoint(API_PREFIXES.publicBranches, id, 'images'),
    reviews: (id: Id) => joinEndpoint(API_PREFIXES.publicBranches, id, 'reviews'),
  },
  courtSlots: (courtId: Id) => joinEndpoint(API_PREFIXES.publicCourts, courtId, 'slots'),
  // Court owner side.
  adminBranches: {
    list: joinEndpoint(API_PREFIXES.adminBranches),
    detail: (id: Id) => joinEndpoint(API_PREFIXES.adminBranches, id),
    courts: (branchId: Id) => joinEndpoint(API_PREFIXES.adminBranches, branchId, 'courts'),
  },
  courts: {
    detail: (id: Id) => joinEndpoint(API_PREFIXES.adminCourts, id),
  },
  timeSlotTemplates: {
    // TODO(F8): no global list, no get-by-id and no PUT for templates in the backend.
    list: joinEndpoint('/time-slot-templates'),
    byCourt: (courtId: Id) => joinEndpoint(API_PREFIXES.adminCourts, courtId, 'time-slot-templates'),
    detail: (id: Id) => joinEndpoint(API_PREFIXES.adminTimeSlotTemplates, id),
    apply: (targetCourtId: Id) => joinEndpoint(API_PREFIXES.adminCourts, targetCourtId, 'apply-template'),
  },
  vouchers: {
    list: joinEndpoint(API_PREFIXES.adminVouchers),
    detail: (id: Id) => joinEndpoint(API_PREFIXES.adminVouchers, id),
    // TODO(F4): vouchers are applied to an existing booking: POST /vouchers/apply.
    apply: joinEndpoint('/vouchers/apply'),
    // TODO(F4): lookup by code is gone; the customer applies the code to a booking instead.
    code: (code: string) => joinEndpoint('/vouchers/code', code),
  },
  bookings: {
    adminList: joinEndpoint(API_PREFIXES.adminBookings),
    create: joinEndpoint(API_PREFIXES.bookings),
    my: joinEndpoint(API_PREFIXES.bookings, 'my'),
    // TODO(F5): guest lookup by bookingCode + phone has no equivalent endpoint (gap report 3.2 item 2).
    lookup: joinEndpoint(API_PREFIXES.bookings, 'lookup'),
    detail: (id: Id) => joinEndpoint(API_PREFIXES.bookings, id),
    cancel: (id: Id) => joinEndpoint(API_PREFIXES.bookings, id, 'cancel'),
  },
  payments: {
    adminTransactions: joinEndpoint(API_PREFIXES.adminPayments, 'transactions'),
    confirm: (id: Id) => joinEndpoint(API_PREFIXES.adminPayments, id, 'confirm'),
    reject: (id: Id) => joinEndpoint(API_PREFIXES.adminPayments, id, 'reject'),
    status: (bookingId: Id) => joinEndpoint('/payments', bookingId, 'status'),
    // TODO(F3): old POST /payments (multi-booking upload) and GET /payments/{id} are gone.
    legacy: joinEndpoint('/payments'),
    uploadReceipt: (bookingId: Id) => joinEndpoint('/payments', bookingId, 'upload-receipt'),
  },
  refunds: {
    pending: joinEndpoint(API_PREFIXES.adminRefunds, 'pending'),
    complete: (id: Id) => joinEndpoint(API_PREFIXES.adminRefunds, id, 'complete'),
  },
  subscriptions: {
    plans: joinEndpoint(API_PREFIXES.plans, 'all'),
    mySubscription: joinEndpoint(API_PREFIXES.subscriptions, 'my-subscription'),
    checkout: joinEndpoint(API_PREFIXES.subscriptions, 'checkout'),
    payment: (orderCode: Id) => joinEndpoint(API_PREFIXES.subscriptions, 'payments', orderCode),
  },
  superAdminDashboard: {
    // stats and details are merged into a single overview.
    overview: joinEndpoint(API_PREFIXES.superAdminDashboard, 'overview'),
  },
  adminDashboard: {
    stats: joinEndpoint(API_PREFIXES.adminDashboard, 'stats'),
    revenueChart: joinEndpoint(API_PREFIXES.adminDashboard, 'revenue-chart'),
    topCourts: joinEndpoint(API_PREFIXES.adminDashboard, 'analytics/top-courts'),
    peakHours: joinEndpoint(API_PREFIXES.adminDashboard, 'analytics/peak-hours'),
    exportRevenue: joinEndpoint(API_PREFIXES.adminDashboard, 'export/revenue'),
  },
} as const
