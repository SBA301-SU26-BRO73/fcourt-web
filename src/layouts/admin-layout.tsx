import { useEffect } from 'react'
import { Link, Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  Calendar,
  Layout,
  Users,
  Building2,
  Bell,
  Ticket,
  Zap,
  Settings,
  LogOut,
  ShieldCheck,
  Package,
  HandCoins,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth-context'
import { tokenStorage } from '@/utils/token'

const NAV_ITEMS = [
  { id: 'dashboard', to: '/admin/dashboard', icon: Home, label: 'Tổng quan' },
  { id: 'bookings', to: '/admin/bookings', icon: Calendar, label: 'Đặt sân' },
  { id: 'refund-requests', to: '/admin/refund-requests', icon: HandCoins, label: 'Hoàn tiền' },
  { id: 'courts', to: '/admin/courts', icon: Layout, label: 'Danh sách sân' },
  { id: 'products', to: '/admin/products', icon: Package, label: 'Sản phẩm' },
  { id: 'staff', to: '/admin/staff', icon: Users, label: 'Nhân viên' },
] as const

const NAV_SYSTEM = [
  { id: 'branches', to: '/admin/branches', icon: Building2, label: 'Chi nhánh' },
  { id: 'vouchers', to: '/admin/vouchers', icon: Ticket, label: 'Mã giảm giá' },
  { id: 'subscriptions', to: '/admin/subscriptions', icon: Zap, label: 'Gói dịch vụ' },
  { id: 'settings', to: '/admin/settings', icon: Settings, label: 'Cài đặt' },
] as const

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Tổng quan hệ thống',
  '/admin/bookings': 'Duyệt thanh toán & Đặt sân',
  '/admin/refund-requests': 'Yêu cầu hoàn tiền',
  '/admin/courts': 'Quản lý sân thể thao',
  '/admin/products': 'Quản lý sản phẩm POS',
  '/admin/staff': 'Quản lý tài khoản nhân viên',
  '/admin/branches': 'Quản lý cơ sở chi nhánh',
  '/admin/vouchers': 'Quản lý mã giảm giá',
  '/admin/subscriptions': 'Gói dịch vụ & Nâng cấp',
  '/admin/settings': 'Cài đặt hệ thống',
}

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoggedIn, clearAuth, logout: logoutSession } = useAuth()
  const hasRecoverableSession = !!tokenStorage.getAccessToken() || !!tokenStorage.getRefreshToken()

  useEffect(() => {
    if (!isLoggedIn || !hasRecoverableSession) {
      if (isLoggedIn && !hasRecoverableSession) clearAuth()
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
  }, [clearAuth, hasRecoverableSession, isLoggedIn, navigate, user])

  if (!isLoggedIn || !hasRecoverableSession || user?.role !== 'ADMIN') return null

  const currentTitle = PAGE_TITLES[location.pathname] || 'Trang Quản trị Admin'

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-xs z-20">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
              FCourt
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-1 uppercase tracking-wider">
              Quản trị viên
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Quản lý
            </p>
            <div className="space-y-1">
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Hệ thống
            </p>
            <div className="space-y-1">
              {NAV_SYSTEM.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer Logout Button */}
        <div className="mt-auto border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={async () => {
              await logoutSession()
              navigate('/auth/login?role=admin', { replace: true })
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={18} className="shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-6 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">{currentTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-xl border border-slate-200/70 bg-slate-50 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>

            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
            >
              <Avatar email={user.email} size={22} />
              <span className="truncate max-w-[140px]">{user.email}</span>
            </Link>
          </div>
        </header>

        {/* Main Body Output */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
