import { Grid2X2, Inbox, Layers, LogOut, ShieldCheck, Tag } from 'lucide-react'
import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/use-auth-context'
import { useUsers } from '@/hooks/use-users'

const NAV = [
  { section: 'Tổng quan' },
  { to: '/super-admin', label: 'Dashboard', icon: Grid2X2, end: true },
  { section: 'Quản lý Admin' },
  { to: '/super-admin/pending', label: 'Chờ duyệt', icon: Inbox, badge: true },
  { section: 'Cấu hình hệ thống' },
  { to: '/super-admin/court-types', label: 'Loại sân', icon: Layers },
  { to: '/super-admin/plans', label: 'Gói đăng ký', icon: Tag },
] as const

export function DashboardLayout() {
  const navigate = useNavigate()
  const { user, isLoggedIn, clearAuth } = useAuth()
  const { data: usersData } = useUsers()

  useEffect(() => {
    if (!isLoggedIn) { navigate('/auth/login', { replace: true }); return }
    if (user?.role !== 'SUPER_ADMIN') { navigate('/403', { replace: true }) }
  }, [isLoggedIn, user, navigate])

  const pendingCount = usersData?.data?.content.length ?? 0

  function logout() {
    clearAuth()
    navigate('/auth/role-pick')
  }

  if (!isLoggedIn || user?.role !== 'SUPER_ADMIN') return null

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[252px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 h-[60px] border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={17} className="text-white" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-slate-900 leading-tight">FCourt</div>
            <div className="text-[11px] text-slate-400 leading-tight">Super Admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV.map((item, i) => {
            if ('section' in item) {
              return (
                <div key={i} className="px-2 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-400">
                  {item.section}
                </div>
              )
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={17} className={isActive ? 'text-green-600' : 'text-slate-400'} />
                    <span className="flex-1">{item.label}</span>
                    {'badge' in item && pendingCount > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-green-600 text-white text-[11px] font-bold flex items-center justify-center">
                        {pendingCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-slate-800 truncate">Super Admin</div>
              <div className="text-[11.5px] text-slate-400 truncate">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              title="Đăng xuất"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
