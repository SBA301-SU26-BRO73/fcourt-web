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
    /** Staff POS catalog (active products of the staff's own branch). */
    list: joinEndpoint(API_PREFIXES.staffPos, 'products'),
    /** Owner list `GET ?branchId&active&query&page&size` and create `POST`. */
    adminList: joinEndpoint(API_PREFIXES.adminPosProducts),
    create: joinEndpoint(API_PREFIXES.adminPosProducts),
    /** `PUT` only: there is no GET or DELETE by id (stop selling with `active=false`). */
    detail: (id: Id) => joinEndpoint(API_PREFIXES.adminPosProducts, id),
    stockAdjustments: (id: Id) => joinEndpoint(API_PREFIXES.adminPosProducts, id, 'stock-adjustments'),
  },
  staff: {
    list: joinEndpoint(API_PREFIXES.adminStaff),
    // TODO(F13): there is no court board endpoint; combine facility courts with public slots.
    courtBoard: joinEndpoint(API_PREFIXES.staff, 'court-board'),
    // TODO(F13): POS orders are created and settled in one call; there is no confirm step.
    posOrderConfirm: (id: Id) => joinEndpoint(API_PREFIXES.staffPos, 'orders', id, 'confirm'),
    me: joinEndpoint(API_PREFIXES.staff, 'me'),
    create: joinEndpoint(API_PREFIXES.adminStaff),
    update: (id: Id) => joinEndpoint(API_PREFIXES.adminStaff, id),
    /** `DELETE` disables the assignment and the login account. */
    delete: (id: Id) => joinEndpoint(API_PREFIXES.adminStaff, id),
    reactivate: (id: Id) => joinEndpoint(API_PREFIXES.adminStaff, id, 'reactivate'),
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
    images: (branchId: Id) => joinEndpoint(API_PREFIXES.adminBranches, branchId, 'images'),
    // The delete route is not nested under the branch id: DELETE /admin/branches/images/{imageId}.
    image: (imageId: Id) => joinEndpoint(API_PREFIXES.adminBranches, 'images', imageId),
  },
  courts: {
    detail: (id: Id) => joinEndpoint(API_PREFIXES.adminCourts, id),
    status: (id: Id) => joinEndpoint(API_PREFIXES.adminCourts, id, 'status'),
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
    usages: (id: Id) => joinEndpoint(API_PREFIXES.adminVouchers, id, 'usages'),
    apply: joinEndpoint('/vouchers/apply'),
  },
  bookings: {
    adminList: joinEndpoint(API_PREFIXES.adminBookings),
    create: joinEndpoint(API_PREFIXES.bookings),
    /** slot-hold-engine: POST creates a hold, DELETE /{holdToken} releases it. */
    holdSlots: joinEndpoint(API_PREFIXES.bookings, 'hold-slots'),
    releaseHold: (holdToken: Id) => joinEndpoint(API_PREFIXES.bookings, 'hold-slots', holdToken),
    my: joinEndpoint(API_PREFIXES.bookings, 'my'),
    /** booking-service: POST { bookingCode, phone } for a guest booking (rate limited, 404 on any miss). */
    lookup: joinEndpoint('/public/bookings', 'lookup'),
    detail: (id: Id) => joinEndpoint(API_PREFIXES.bookings, id),
    cancel: (id: Id) => joinEndpoint(API_PREFIXES.bookings, id, 'cancel'),
    cancellationPolicy: (id: Id) => joinEndpoint(API_PREFIXES.bookings, id, 'cancellation-policy'),
  },
  payments: {
    adminTransactions: joinEndpoint(API_PREFIXES.adminPayments, 'transactions'),
    confirm: (id: Id) => joinEndpoint(API_PREFIXES.adminPayments, id, 'confirm'),
    reject: (id: Id) => joinEndpoint(API_PREFIXES.adminPayments, id, 'reject'),
    status: (bookingId: Id) => joinEndpoint('/payments', bookingId, 'status'),
    checkoutInfo: (bookingId: Id) => joinEndpoint('/payments', 'checkout-info', bookingId),
    confirmFree: (bookingId: Id) => joinEndpoint('/payments', bookingId, 'confirm-free'),
    uploadReceipt: (bookingId: Id) => joinEndpoint('/payments', bookingId, 'upload-receipt'),
    ticket: (bookingId: Id) => joinEndpoint('/payments', bookingId, 'ticket'),
    myTransactions: joinEndpoint('/payments/my-transactions'),
  },
  reviews: {
    create: joinEndpoint('/reviews'),
    images: joinEndpoint('/reviews/images'),
  },
  refunds: {
    request: joinEndpoint('/refunds/request'),
    byBooking: (bookingId: Id) => joinEndpoint('/refunds/booking', bookingId),
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
