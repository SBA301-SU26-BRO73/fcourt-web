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
import { NotFoundPage } from '@/pages/not-found/not-found-page'
import {AdminBookingPage} from "@/pages/admin/AdminBookingPage.tsx";
import { StaffPage } from '@/pages/staff/staff-page'
import { StaffSchedulePage } from '@/pages/staff/staff-schedule-page'
import { StaffCheckInPage } from '@/pages/staff/staff-check-in-page'
import { StaffWalkInPage } from '@/pages/staff/staff-walk-in-page'
import { StaffCheckoutPage } from '@/pages/staff/staff-checkout-page'
import { ProfilePage } from '@/pages/profile/profile-page'
import { TimeSlotDetailPage } from '@/pages/time-slots/time-slot-detail-page'
import { TimeSlotFormPage } from '@/pages/time-slots/time-slot-form-page'
import { TimeSlotListPage } from '@/pages/time-slots/time-slot-list-page'
import HomePage from '@/pages/home/home-page'


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
        element: <Navigate to="staff" replace />,
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
    ],
  },
  {
    path: 'super-admin',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'pending', element: <PendingPage /> },
      { path: 'court-types', element: <CourtTypesPage /> },
      { path: 'plans', element: <PlansPage /> },
    ],
  },
  { path: 'profile', element: <ProfilePage /> },
  { path: '403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
])
