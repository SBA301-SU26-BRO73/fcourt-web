import { createBrowserRouter, Navigate } from 'react-router-dom'

import BranchDetailPage from '@/pages/branch/branch-detail-page'
import SlotBookingPage from '@/pages/slot-booking/slot-booking-page'
import GuestBranchListPage from '@/pages/branch/branch-list-page'
import { AdminLayout } from '@/layouts/admin-layout'
import { MainLayout } from '@/layouts/main-layout'
import { StaffLayout } from '@/layouts/staff-layout'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import { CourtTypesPage } from '@/pages/super-admin/court-types-page'
import { DashboardPage } from '@/pages/super-admin/dashboard-page'
import { PendingPage } from '@/pages/super-admin/pending-page'
import { PlansPage } from '@/pages/super-admin/plans-page'
import { SuperAdminProductsPage } from '@/pages/super-admin/products-page'
import { UserManagementPage } from '@/pages/super-admin/user-management-page'
import { ForgotPage } from '@/pages/auth/forgot-page'
import { LoginPage } from '@/pages/auth/login-page'
import { RegisterAdminPage } from '@/pages/auth/register-admin-page'
import { RegisterCustomerPage } from '@/pages/auth/register-customer-page'
import { RolePickPage } from '@/pages/auth/role-pick-page'
import { DocsPage } from '@/pages/docs/docs-page'
import { ForbiddenPage } from '@/pages/errors/forbidden-page'
import { BranchFormPage } from '@/pages/branches/branch-form-page'
import { BranchListPage } from '@/pages/branches/branch-list-page'
import { CourtDetailPage } from '@/pages/courts/court-detail-page'
import { CourtFormPage } from '@/pages/courts/court-form-page'
import { CourtListPage } from '@/pages/courts/court-list-page'
import { ProductFormPage } from '@/pages/products/product-form-page'
import { ProductListPage } from '@/pages/products/product-list-page'
import { NotFoundPage } from '@/pages/not-found/not-found-page'
import { MyBookingsPage } from '@/pages/booking/my-bookings-page'
import { BookingLookupPage } from '@/pages/booking/booking-lookup-page'
import {AdminBookingPage} from "@/pages/admin/AdminBookingPage.tsx";
import AdminVoucherPage from "@/pages/admin/vouchers/AdminVoucherPage.tsx";
import { AdminDashboardPage } from '@/pages/admin/admin-dashboard-page'
import { StaffPage } from '@/pages/staff/staff-page'
import { StaffSchedulePage } from '@/pages/staff/staff-schedule-page'
import { StaffCheckInPage } from '@/pages/staff/staff-check-in-page'
import { StaffWalkInPage } from '@/pages/staff/staff-walk-in-page'
import { StaffCheckoutPage } from '@/pages/staff/staff-checkout-page'
import { StaffBoardPage } from '@/pages/staff/staff-board-page'
import { StaffPosPage } from '@/pages/staff/staff-pos-page'
import { ProfilePage } from '@/pages/profile/profile-page'
import { PaymentPage } from '@/pages/payment/PaymentPage'
import { ConfirmationPage } from '@/pages/payment/ConfirmationPage'
import { TimeSlotDetailPage } from '@/pages/time-slots/time-slot-detail-page'
import { TimeSlotFormPage } from '@/pages/time-slots/time-slot-form-page'
import { TimeSlotListPage } from '@/pages/time-slots/time-slot-list-page'
import HomePage from '@/pages/home/home-page'
import SubscriptionPlansPage from '@/pages/admin/subscriptions/SubscriptionPlansPage'
import SubscriptionPaymentPage from '@/pages/admin/subscriptions/SubscriptionPaymentPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'docs', element: <DocsPage /> },
      {
        path: 'branches',
        children: [
          { index: true, element: <GuestBranchListPage /> },
          { path: ':id', element: <BranchDetailPage /> },
        ],
      },
      {
        path: 'slot-booking',
        element: <SlotBookingPage />,
      },
      { path: 'payment', element: <PaymentPage /> },
      { path: 'confirmation', element: <ConfirmationPage /> },
      { path: 'my-bookings', element: <MyBookingsPage /> },
      { path: 'lookup', element: <BookingLookupPage /> },
    ],
  },
  {
    path: 'auth',
    children: [
      { index: true, element: <Navigate to="/auth/role-pick" replace /> },
      { path: 'role-pick', element: <RolePickPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register/customer', element: <RegisterCustomerPage /> },
      { path: 'register/court-owner', element: <RegisterAdminPage /> },
      { path: 'forgot-password', element: <ForgotPage /> },
      {
        path: 'branches',
        element: <BranchListPage />,
      },
      {
        path: 'branches/new',
        element: <BranchFormPage mode="create" />,
      },
      {
        path: 'branches/:branchId/edit',
        element: <BranchFormPage mode="edit" />,
      },
      {
        path: 'courts',
        element: <CourtListPage />,
      },
      {
        path: 'courts/new',
        element: <CourtFormPage mode="create" />,
      },
      {
        path: 'courts/:courtId',
        element: <CourtDetailPage />,
      },
      {
        path: 'courts/:courtId/edit',
        element: <CourtFormPage mode="edit" />,
      },
      {
        path: 'time-slots',
        element: <TimeSlotListPage />,
      },
      {
        path: 'time-slots/new',
        element: <TimeSlotFormPage mode="create" />,
      },
      {
        path: 'time-slots/:timeSlotId',
        element: <TimeSlotDetailPage />,
      },
      {
        path: 'time-slots/:timeSlotId/edit',
        element: <TimeSlotFormPage mode="edit" />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboardPage />,
      },
      {
        path: 'staff',
        element: <StaffPage />,
      },
      {
        path: 'slot-booking',
        element: <SlotBookingPage />,
      },
      {
        path: 'branches',
        element: <BranchListPage />,
      },
      {
        path: 'branches/new',
        element: <BranchFormPage mode="create" />,
      },
      {
        path: 'branches/:branchId/edit',
        element: <BranchFormPage mode="edit" />,
      },
      {
        path: 'courts',
        element: <CourtListPage />,
      },
      {
        path: 'courts/new',
        element: <CourtFormPage mode="create" />,
      },
      {
        path: 'courts/:courtId',
        element: <CourtDetailPage />,
      },
      {
        path: 'courts/:courtId/edit',
        element: <CourtFormPage mode="edit" />,
      },
      {
        path: 'products',
        element: <ProductListPage />,
      },
      {
        path: 'products/new',
        element: <ProductFormPage mode="create" />,
      },
      {
        path: 'products/:productId/edit',
        element: <ProductFormPage mode="edit" />,
      },
      {
        path: 'time-slots',
        element: <TimeSlotListPage />,
      },
      {
        path: 'time-slots/new',
        element: <TimeSlotFormPage mode="create" />,
      },
      {
        path: 'time-slots/:timeSlotId',
        element: <TimeSlotDetailPage />,
      },
      {
        path: 'time-slots/:timeSlotId/edit',
        element: <TimeSlotFormPage mode="edit" />,
      },
      {
        path: 'bookings',
        element: <AdminBookingPage />,
      },
      {
        path: 'vouchers',
        element: <AdminVoucherPage />,
      },
      {
        path: 'subscriptions',
        element: <SubscriptionPlansPage />,
      },
      {
        path: 'subscriptions/payment',
        element: <SubscriptionPaymentPage />,
      },
      {
        path: 'subscriptions/payment-result',
        element: <SubscriptionPaymentPage />,
      },
    ],
  },
  {
    path: '/staff',
    element: <StaffLayout />,
    children: [
      {
        index: true,
        element: <StaffSchedulePage />,
      },
      {
        path: 'check-in',
        element: <StaffCheckInPage />,
      },
      {
        path: 'walk-in',
        element: <StaffWalkInPage />,
      },
      {
        path: 'checkout/:bookingId',
        element: <StaffCheckoutPage />,
      },
      {
        path: 'board',
        element: <StaffBoardPage />,
      },
      {
        path: 'pos',
        element: <StaffPosPage />,
      },
    ],
  },
  {
    path: 'super-admin',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UserManagementPage /> },
      { path: 'pending', element: <PendingPage /> },
      { path: 'court-types', element: <CourtTypesPage /> },
      { path: 'plans', element: <PlansPage /> },
      { path: 'products', element: <SuperAdminProductsPage /> },
    ],
  },
  { path: 'profile', element: <ProfilePage /> },
  { path: '403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
])
