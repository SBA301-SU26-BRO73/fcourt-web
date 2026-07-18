import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Activity, LayoutGrid, ScanLine, PlusCircle } from 'lucide-react'

import { useStaffSession } from '@/context/staff-session'
import { useTodaySchedule } from '@/hooks/staff/use-today-schedule'
import { useBranchGrid } from '@/hooks/staff/use-branch-grid'
import { KpiCard } from '@/pages/staff/components/kpi-card'
import { ScheduleGrid } from '@/pages/staff/components/schedule-grid'
import {
  STATUS_STYLES,
  buildTimeWindow,
  nowMinutes,
  timeToMinutes,
} from '@/pages/staff/schedule-utils'
import type { StaffScheduleItem } from '@/types/staff'

function isPlayingNow(item: StaffScheduleItem): boolean {
  if (item.status !== 'CHECKED_IN') return false
  const now = nowMinutes()
  return now >= timeToMinutes(item.startTime) && now < timeToMinutes(item.endTime)
}

export function StaffSchedulePage() {
  const navigate = useNavigate()
  const { staffUserId, branchId } = useStaffSession()
  const scheduleQuery = useTodaySchedule()
  const { courts, branch, isLoading: gridLoading } = useBranchGrid()

  const schedule = useMemo(() => scheduleQuery.data ?? [], [scheduleQuery.data])

  const playingCount = schedule.filter((b) => b.status === 'CHECKED_IN').length
  const courtsInUse = new Set(
    schedule.filter(isPlayingNow).map((b) => b.courtId),
  ).size
  const totalCourts = courts?.length ?? 0
  const freeCourts = Math.max(0, totalCourts - courtsInUse)

  const { openMin, rows } = buildTimeWindow(branch?.openTime, branch?.closeTime)

  if (staffUserId == null || branchId == null) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        No staff session. Set <code className="font-mono">VITE_STAFF_USER_ID</code>{' '}
        and <code className="font-mono">VITE_BRANCH_ID</code> in{' '}
        <code className="font-mono">.env.local</code> and restart the dev server.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard
          icon={Calendar}
          iconClass="bg-blue-50 text-blue-600"
          value={schedule.length}
          label="Bookings today"
        />
        <KpiCard
          icon={Activity}
          iconClass="bg-green-50 text-green-600"
          value={playingCount}
          label="Currently playing"
        />
        <KpiCard
          icon={LayoutGrid}
          iconClass="bg-slate-100 text-slate-600"
          value={`${freeCourts} / ${totalCourts}`}
          label="Courts free"
        />
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          to="/staff/check-in"
          className="flex items-center gap-3 rounded-xl bg-green-600 px-5 py-4 text-white shadow-sm transition-colors hover:bg-green-700"
        >
          <ScanLine size={22} />
          <div className="leading-tight">
            <div className="text-base font-semibold">Scan QR to check in</div>
            <div className="text-sm text-green-100">
              Scan a booking QR or enter the code manually
            </div>
          </div>
          <span className="ml-auto text-xl">→</span>
        </Link>
        <Link
          to="/staff/walk-in"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
        >
          <PlusCircle size={22} className="text-green-600" />
          <div className="leading-tight">
            <div className="text-base font-semibold">New walk-in booking</div>
            <div className="text-sm text-slate-500">Create a booking at the counter</div>
          </div>
          <span className="ml-auto text-xl text-slate-400">→</span>
        </Link>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="font-medium text-slate-600">Today</span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-blue-200 bg-blue-50" />
          {STATUS_STYLES.CONFIRMED.label}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-green-200 bg-green-50" />
          {STATUS_STYLES.CHECKED_IN.label}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-slate-200 bg-slate-100" />
          {STATUS_STYLES.COMPLETED.label}
        </span>
      </div>

      {/* Grid */}
      {scheduleQuery.isLoading || gridLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          Loading schedule…
        </div>
      ) : scheduleQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700">
          Could not load today&apos;s schedule. Check the backend is running.
        </div>
      ) : totalCourts === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          No courts found for this branch.
        </div>
      ) : (
        <ScheduleGrid
          courts={courts ?? []}
          schedule={schedule}
          openMin={openMin}
          rows={rows}
          onBookingClick={(item) => {
            if (item.status === 'CHECKED_IN') {
              navigate(`/staff/checkout/${item.bookingId}`, { state: item })
            } else {
              navigate('/staff/check-in')
            }
          }}
        />
      )}
    </div>
  )
}
