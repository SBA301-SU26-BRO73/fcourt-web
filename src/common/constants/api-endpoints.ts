/**
 * Paths are relative to VITE_API_URL (which ends with `/api`). Each path matches the
 * route in the microservice backend; TODO(Fx) marks calls whose contract still has to
 * be reworked in that work item of docs/api-gap-report.md (section 3.3).
 */
export const API_PREFIXES = {
  auth: '/auth',
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
    // auth-service: paged list with role/status/query filters (SUPER_ADMIN only).
    list: joinEndpoint(API_PREFIXES.superAdmin, 'users'),
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
    create: joinEndpoint(API_PREFIXES.adminStaff),
    update: (id: Id) => joinEndpoint(API_PREFIXES.adminStaff, id),
    /** `DELETE` disables the assignment and the login account. */
    delete: (id: Id) => joinEndpoint(API_PREFIXES.adminStaff, id),
    reactivate: (id: Id) => joinEndpoint(API_PREFIXES.adminStaff, id, 'reactivate'),
  },
  // Front-desk operations (F13): staff-operations-service, facility-service staff routes, pos-retail-service.
  counter: {
    me: joinEndpoint(API_PREFIXES.staff, 'me'),
    branch: (branchId: Id) => joinEndpoint(API_PREFIXES.staff, 'branches', branchId),
    branchCourts: (branchId: Id) => joinEndpoint(API_PREFIXES.staff, 'branches', branchId, 'courts'),
    schedule: joinEndpoint(API_PREFIXES.staff, 'schedule'),
    scheduleToday: joinEndpoint(API_PREFIXES.staff, 'schedule/today'),
    checkInPreview: joinEndpoint(API_PREFIXES.staff, 'check-in/preview'),
    checkInVerify: joinEndpoint(API_PREFIXES.staff, 'check-in/verify'),
    checkInManual: joinEndpoint(API_PREFIXES.staff, 'check-in/manual'),
    checkInOffline: joinEndpoint(API_PREFIXES.staff, 'check-in/offline'),
    offlineTickets: joinEndpoint(API_PREFIXES.staff, 'offline/tickets'),
    walkIn: joinEndpoint(API_PREFIXES.staff, 'walk-in'),
    checkoutPreview: (bookingId: Id) => joinEndpoint(API_PREFIXES.staff, 'bookings', bookingId, 'checkout-preview'),
    checkout: (bookingId: Id) => joinEndpoint(API_PREFIXES.staff, 'bookings', bookingId, 'checkout'),
    posProducts: joinEndpoint(API_PREFIXES.staffPos, 'products'),
    posOrders: joinEndpoint(API_PREFIXES.staffPos, 'orders'),
    posOrder: (orderId: Id) => joinEndpoint(API_PREFIXES.staffPos, 'orders', orderId),
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
    byCourt: (courtId: Id) => joinEndpoint(API_PREFIXES.adminCourts, courtId, 'time-slot-templates'),
    preview: (courtId: Id) => joinEndpoint(API_PREFIXES.adminCourts, courtId, 'time-slot-templates', 'preview'),
    /** DELETE, and PUT (backend PR "PUT /api/admin/time-slot-templates/{id}"). */
    detail: (id: Id) => joinEndpoint(API_PREFIXES.adminTimeSlotTemplates, id),
    apply: (courtId: Id) => joinEndpoint(API_PREFIXES.adminCourts, courtId, 'apply-template'),
    bulkApply: joinEndpoint(API_PREFIXES.adminCourts, 'bulk-apply-template'),
    bulkPreview: joinEndpoint(API_PREFIXES.adminCourts, 'bulk-apply-template', 'preview'),
  },
  pricingRules: {
    list: (courtId: Id) => joinEndpoint(API_PREFIXES.adminCourts, courtId, 'pricing-rules'),
    detail: (courtId: Id, ruleId: Id) => joinEndpoint(API_PREFIXES.adminCourts, courtId, 'pricing-rules', ruleId),
    copyWeekdayToWeekend: (courtId: Id) =>
      joinEndpoint(API_PREFIXES.adminCourts, courtId, 'pricing-rules', 'copy-weekday-to-weekend'),
  },
  courtLocks: {
    slots: joinEndpoint(API_PREFIXES.adminCourts, 'lock-slots'),
    slot: (id: Id) => joinEndpoint(API_PREFIXES.adminCourts, 'lock-slots', id),
    outOfService: joinEndpoint(API_PREFIXES.adminCourts, 'out-of-service'),
    group: (groupId: Id) => joinEndpoint(API_PREFIXES.adminCourts, 'out-of-service', groupId),
  },
  vouchers: {
    list: joinEndpoint(API_PREFIXES.adminVouchers),
    detail: (id: Id) => joinEndpoint(API_PREFIXES.adminVouchers, id),
    usages: (id: Id) => joinEndpoint(API_PREFIXES.adminVouchers, id, 'usages'),
    apply: joinEndpoint('/vouchers/apply'),
  },
  bookings: {
    adminList: joinEndpoint(API_PREFIXES.adminBookings),
    adminCancel: (id: Id) => joinEndpoint(API_PREFIXES.adminBookings, id, 'cancel'),
    fullCourt: {
      quote: joinEndpoint(API_PREFIXES.adminBookings, 'full-court', 'quote'),
      root: joinEndpoint(API_PREFIXES.adminBookings, 'full-court'),
      detail: (id: Id) => joinEndpoint(API_PREFIXES.adminBookings, 'full-court', id),
      cancel: (id: Id) => joinEndpoint(API_PREFIXES.adminBookings, 'full-court', id, 'cancel'),
      relock: (id: Id) => joinEndpoint(API_PREFIXES.adminBookings, 'full-court', id, 'relock'),
    },
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
    adminPending: joinEndpoint(API_PREFIXES.adminPayments, 'pending'),
    adminTransactions:joinEndpoint(API_PREFIXES.adminPayments, 'transactions'),
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
    approve: (id: Id) => joinEndpoint(API_PREFIXES.adminRefunds, id, 'approve'),
    reject: (id: Id) => joinEndpoint(API_PREFIXES.adminRefunds, id, 'reject'),
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
