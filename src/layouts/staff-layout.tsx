import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { CalendarDays, Grid3x3, PlusCircle, ScanLine, ShoppingCart } from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth-context'
import { useStaffSession } from '@/context/staff-session'
import { tokenStorage } from '@/utils/token'

const NAV_ITEMS = [
  { to: '/staff', label: 'Lịch', icon: CalendarDays, end: true },
  { to: '/staff/check-in', label: 'Check-in', icon: ScanLine, end: false },
  { to: '/staff/walk-in', label: 'Walk-in', icon: PlusCircle, end: false },
  { to: '/staff/board', label: 'Bảng sân', icon: Grid3x3, end: false },
  { to: '/staff/pos', label: 'Bán hàng', icon: ShoppingCart, end: false },
]

/**
 * Front-desk tablet chrome: compact header + single-task body.
 * Distinct from AdminLayout (sidebar) — this is the staff check-in station.
 */
export function StaffLayout() {
  const navigate = useNavigate()
  const { user, isLoggedIn, clearAuth } = useAuth()
  const hasAccessToken = !!tokenStorage.getAccessToken()
  const { branchName } = useStaffSession()

  useEffect(() => {
    if (!isLoggedIn || !hasAccessToken) {
      if (isLoggedIn && !hasAccessToken) clearAuth()
      navigate('/auth/login', { replace: true })
      return
    }

    if (user?.role !== 'STAFF') {
      navigate('/403', { replace: true })
    }
  }, [isLoggedIn, hasAccessToken, user, navigate, clearAuth])

  if (!isLoggedIn || !hasAccessToken || user?.role !== 'STAFF') {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50">
      <header className="sticky top-0 z-20 flex w-full max-w-[1180px] flex-col border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex items-center gap-3 px-6 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-sm font-bold text-white">
            B
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide text-slate-900">
              BRO73 Front-desk
            </div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Staff check-in
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            {branchName ?? 'Loading branch…'}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Avatar email={user.email} size={28} />
          </div>
        </div>

        <nav className="no-scrollbar flex w-full items-center gap-1 overflow-x-auto border-t border-slate-100 px-6 py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={16} className={isActive ? 'text-green-600' : 'text-slate-400'} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="w-full max-w-[1180px] flex-1 px-6 py-5">
        <Outlet />
      </main>
    </div>
  )
}
