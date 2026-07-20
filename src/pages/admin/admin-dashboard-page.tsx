import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  RefreshCw,
  Trophy,
  WalletCards,
} from 'lucide-react'

import { useAdminDashboard } from '@/hooks/use-admin-dashboard'
import type {
  AdminDashboardStats,
  AdminPeakHourPoint,
  AdminRevenuePoint,
  AdminTopCourtRow,
} from '@/services/admin/admin-dashboard.service'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('en-US')

export function AdminDashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminDashboard()

  if (isLoading) {
    return (
      <div className="min-h-full bg-slate-50 p-5 sm:p-6 lg:p-8">
        <DashboardSkeleton />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="min-h-full bg-slate-50 p-5 sm:p-6 lg:p-8">
        <div className="rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-rose-700">Unable to load the Admin dashboard</div>
          <p className="mt-2 text-sm text-slate-500">
            {(error as Error)?.message || 'Please try again later.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1440px] space-y-6 p-5 sm:p-6 lg:p-8">
        <Header isFetching={isFetching} onRefresh={() => refetch()} />
        <KpiGrid data={data} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <RevenuePanel data={data.revenueChart} />
          <OccupancyPanel data={data} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)]">
          <PeakHoursPanel data={data.peakHours} />
          <TopCourtsPanel data={data.topCourts} />
        </div>
      </div>
    </div>
  )
}

function Header({ isFetching, onRefresh }: { isFetching: boolean; onRefresh: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
          <Activity size={14} />
          Branch Admin Dashboard
        </div>
        <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
          Court Operations Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Booking revenue, occupancy rate, peak hours, and top courts based on live data.
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isFetching}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
        Refresh
      </button>
    </div>
  )
}

function KpiGrid({ data }: { data: AdminDashboardStats }) {
  const items = [
    {
      label: "Today's revenue",
      value: formatCurrency(data.todayRevenue),
      meta: `${numberFormatter.format(data.todayBookings)} bookings`,
      icon: CircleDollarSign,
      tone: 'emerald',
    },
    {
      label: 'Monthly revenue',
      value: formatCurrency(data.monthRevenue),
      meta: `${numberFormatter.format(data.monthBookings)} bookings this month`,
      icon: WalletCards,
      tone: 'sky',
    },
    {
      label: 'Occupancy rate',
      value: `${formatPercent(data.occupancyRate)}`,
      meta: `${numberFormatter.format(data.bookedSlotsLast30Days)} / ${numberFormatter.format(data.availableSlotsLast30Days)} slots in 30 days`,
      icon: BarChart3,
      tone: 'amber',
    },
    {
      label: 'Operating scale',
      value: `${numberFormatter.format(data.activeCourtCount)} courts`,
      meta: `${numberFormatter.format(data.activeBranchCount)} active branches`,
      icon: Building2,
      tone: 'violet',
    },
  ] as const

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, meta, icon: Icon, tone }) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</div>
              <div className="mt-3 text-2xl font-black text-slate-950">{value}</div>
            </div>
            <div className={iconClassName(tone)}>
              <Icon size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500">
            <ArrowUpRight size={15} className="text-emerald-600" />
            {meta}
          </div>
        </div>
      ))}
    </div>
  )
}

function RevenuePanel({ data }: { data: AdminRevenuePoint[] }) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1)
  const points = data.map((item, index) => {
    const x = data.length === 1 ? 0 : (index / (data.length - 1)) * 100
    const y = 100 - (item.revenue / maxRevenue) * 82 - 8
    return `${x},${y}`
  })

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <PanelTitle
        icon={CalendarDays}
        title="Revenue in the Last 14 Days"
        description="Total revenue from confirmed, checked-in, or completed bookings."
      />
      <div className="mt-6 h-[320px]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-44 w-full overflow-visible">
          <defs>
            <linearGradient id="adminRevenueFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            points={points.join(' ')}
            stroke="#059669"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.8"
            vectorEffect="non-scaling-stroke"
          />
          <polygon
            fill="url(#adminRevenueFill)"
            points={`0,100 ${points.join(' ')} 100,100`}
          />
        </svg>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {data.filter((_, index) => index % 2 === 0).map((item) => (
            <div key={item.date} className="rounded-md bg-slate-50 px-2 py-2">
              <div className="text-[11px] font-bold text-slate-400">{formatShortDate(item.date)}</div>
              <div className="mt-1 truncate text-xs font-extrabold text-slate-800">
                {formatCompactCurrency(item.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function OccupancyPanel({ data }: { data: AdminDashboardStats }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(data.occupancyRate, 100) / 100) * circumference

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <PanelTitle
        icon={BarChart3}
        title="Occupancy Rate"
        description="Calculated from active schedule slots in the last 30 days."
      />
      <div className="mt-6 flex flex-col items-center">
        <div className="relative h-44 w-44">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#f59e0b"
              strokeLinecap="round"
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-950">{formatPercent(data.occupancyRate)}</span>
            <span className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">Occupancy</span>
          </div>
        </div>
        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <MiniMetric label="Booked slots" value={numberFormatter.format(data.bookedSlotsLast30Days)} />
          <MiniMetric label="Slot capacity" value={numberFormatter.format(data.availableSlotsLast30Days)} />
          <MiniMetric label="Year revenue" value={formatCompactCurrency(data.yearRevenue)} />
          <MiniMetric label="Monthly bookings" value={numberFormatter.format(data.monthBookings)} />
        </div>
      </div>
    </section>
  )
}

function PeakHoursPanel({ data }: { data: AdminPeakHourPoint[] }) {
  const maxSlots = Math.max(...data.map((item) => item.bookedSlots), 1)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <PanelTitle
        icon={Clock3}
        title="Peak Hours"
        description="Booked slots by time range."
      />
      <div className="mt-6 flex h-64 items-end gap-2">
        {data.map((item) => {
          const height = Math.max(8, (item.bookedSlots / maxSlots) * 100)
          return (
            <div key={item.hour} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="relative flex w-full items-end justify-center">
                <div
                  className="w-full max-w-8 rounded-t-md bg-slate-900 transition group-hover:bg-emerald-600"
                  style={{ height: `${height}%` }}
                />
                <div className="pointer-events-none absolute bottom-full mb-2 hidden min-w-32 rounded-md bg-slate-950 px-3 py-2 text-center text-xs font-semibold text-white shadow-xl group-hover:block">
                  {item.bookedSlots} slot
                  <div className="text-slate-300">{formatCompactCurrency(item.revenue)}</div>
                </div>
              </div>
              <div className="text-[10px] font-bold text-slate-400 [writing-mode:vertical-rl] sm:[writing-mode:horizontal-tb]">
                {item.hour}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function TopCourtsPanel({ data }: { data: AdminTopCourtRow[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <PanelTitle
        icon={Trophy}
        title="Top Revenue Courts"
        description="Ranked by booking revenue in the current year."
      />
      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
        {data.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center bg-slate-50 text-center">
            <Trophy size={38} className="text-slate-300" />
            <div className="mt-3 text-sm font-bold text-slate-700">No booking revenue yet</div>
            <div className="mt-1 text-xs text-slate-500">Top courts will appear after bookings are confirmed.</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-400">Court</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-widest text-slate-400">Slot</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-widest text-slate-400">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.map((row, index) => (
                <tr key={row.courtId} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-sm font-black text-emerald-700">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-slate-900">{row.courtName}</div>
                        <div className="truncate text-xs font-medium text-slate-500">{row.branchName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-bold text-slate-700">
                    {numberFormatter.format(row.bookedSlots)}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-black text-slate-950">
                    {formatCurrency(row.revenue)}
                    <div className="text-xs font-medium text-slate-400">
                      {numberFormatter.format(row.bookingCount)} booking
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

function PanelTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BarChart3
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-3">
      <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-black text-slate-900">{value}</div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div className="h-32 animate-pulse rounded-lg bg-white" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 animate-pulse rounded-lg bg-white" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-lg bg-white" />
        <div className="h-96 animate-pulse rounded-lg bg-white" />
      </div>
    </div>
  )
}

function iconClassName(tone: 'emerald' | 'sky' | 'amber' | 'violet') {
  const classes = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    sky: 'bg-sky-50 text-sky-700 border-sky-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
  }

  return `flex h-11 w-11 items-center justify-center rounded-lg border ${classes[tone]}`
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value || 0)
}

function formatCompactCurrency(value: number) {
  if (!value) return 'VND 0'
  if (value >= 1_000_000_000) return `VND ${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `VND ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `VND ${Math.round(value / 1_000)}K`
  return `VND ${numberFormatter.format(value)}`
}

function formatPercent(value: number) {
  return `${numberFormatter.format(value || 0)}%`
}

function formatShortDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
}
