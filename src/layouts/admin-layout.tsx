import { useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Calendar,
  Layout,
  Users,
  CreditCard,
  Activity,
  Building2,
  Settings,
  Bell,
  ChevronDown,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth-context'
import { tokenStorage } from '@/utils/token'

const NAV_ITEMS = [
  { id: 'dashboard', to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
  { id: 'bookings', to: '/admin/bookings', icon: Calendar, label: 'Bookings' },
  { id: 'courts', to: '/admin/courts', icon: Layout, label: 'Courts' },
  { id: 'staff', to: '/admin/staff', icon: Users, label: 'Staff' },
  { id: 'payments', to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { id: 'reports', to: '/admin/reports', icon: Activity, label: 'Reports' },
] as const

const NAV_SYSTEM = [
  { id: 'branches', to: '/admin/branches', icon: Building2, label: 'Branches' },
  { id: 'settings', to: '/admin/settings', icon: Settings, label: 'Settings' },
] as const

export function AdminLayout() {
  const navigate = useNavigate()
  const { user, isLoggedIn, clearAuth } = useAuth()
  const hasAccessToken = !!tokenStorage.getAccessToken()

  useEffect(() => {
    if (!isLoggedIn || !hasAccessToken) {
      if (isLoggedIn && !hasAccessToken) clearAuth()
      navigate('/auth/login?role=admin', { replace: true })
      return
    }

    if (user?.role === 'SUPER_ADMIN') {
      navigate('/super-admin', { replace: true })
      return
    }

    if (user?.role !== 'ADMIN') {
      navigate('/403', { replace: true })
    }
  }, [clearAuth, hasAccessToken, isLoggedIn, navigate, user])

  if (!isLoggedIn || !hasAccessToken || user?.role !== 'ADMIN') return null

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-sm font-bold text-white">
            B
          </div>
          <div>
            <div className="text-sm font-bold tracking-wide text-slate-900">
              BRO73
            </div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Admin
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Workspace
          </p>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}

          <p className="mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            System
          </p>
          {NAV_SYSTEM.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Profile */}
        <div className="flex items-center gap-2.5 border-t border-slate-100 px-3 py-3">
          <Avatar email="admin@bro73.app" size={32} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-slate-800">
              Admin
            </div>
            <div className="truncate text-xs text-slate-400">Owner</div>
          </div>
          <ChevronDown size={14} className="shrink-0 text-slate-400" />
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <span>BRO73</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
              <Bell size={17} />
            </button>
            <div className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100">
              <Avatar email="admin@bro73.app" size={24} />
              <span className="font-medium">Admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
