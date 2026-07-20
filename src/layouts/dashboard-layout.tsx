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
    <div className="flex h-screen overflow-hidden bg-[#F8F9FB]">
      <aside className="flex w-[272px] flex-shrink-0 flex-col border-r border-slate-100 bg-white shadow-[8px_0_30px_rgba(15,23,42,0.04)]">
        <div className="flex h-[72px] items-center gap-3 border-b border-slate-100 px-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-700 shadow-lg shadow-emerald-100">
            <ShieldCheck size={17} className="text-white" />
          </div>
          <div>
            <div className="text-[15px] font-extrabold leading-tight text-slate-900">FCourt</div>
            <div className="text-[11px] font-semibold leading-tight text-slate-400">Super Admin</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
          {NAV.map((item, i) => {
            if ('section' in item) {
              return (
                <div key={i} className="flex items-center gap-2 px-2 pb-1.5 pt-5 text-[10.5px] font-bold uppercase tracking-widest text-slate-400 first:pt-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{item.section}</span>
                </div>
              )
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[13.5px] transition ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 font-extrabold text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                      : 'font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                        isActive ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      <item.icon size={17} />
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {'badge' in item && pendingCount > 0 && (
                      <span className="flex h-6 min-w-6 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 px-2 text-[11px] font-extrabold text-white shadow-lg shadow-orange-100">
                        {pendingCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-slate-100 px-4 pb-5 pt-4">
          <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 px-3 py-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-extrabold text-white">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-bold text-slate-800">Super Admin</div>
              <div className="truncate text-[11.5px] font-medium text-slate-400">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700 hover:shadow-sm"
              title="Đăng xuất"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
