import { Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { Avatar } from '@/components/ui/avatar'
import { getBranchDetail } from '@/services/branch/branch.api'
import { useStaffSession } from '@/context/staff-session'

/**
 * Front-desk tablet chrome: compact header + single-task body.
 * Distinct from AdminLayout (sidebar) — this is the staff check-in station.
 */
export function StaffLayout() {
  const { staffUserId, branchId } = useStaffSession()

  const { data: branch } = useQuery({
    queryKey: ['branch-detail', branchId],
    queryFn: () => getBranchDetail(branchId as number),
    enabled: branchId != null,
    staleTime: 5 * 60_000,
  })

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50">
      <header className="sticky top-0 z-20 flex w-full max-w-[1180px] items-center gap-3 border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
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
          {branch?.name ?? (branchId != null ? `Branch #${branchId}` : 'No branch')}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Avatar email={`staff-${staffUserId ?? 'unknown'}@bro73`} size={28} />
        </div>
      </header>

      <main className="w-full max-w-[1180px] flex-1 px-6 py-5">
        <Outlet />
      </main>
    </div>
  )
}
