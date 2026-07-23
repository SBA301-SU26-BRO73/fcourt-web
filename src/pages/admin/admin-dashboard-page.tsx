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
import { getApiErrorMessage } from '@/common/utils/api-error'
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
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardSkeleton />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-rose-700">Không thể tải dữ liệu Bảng điều khiển Admin</div>
          <p className="mt-2 text-sm text-slate-500">
            {getApiErrorMessage(error, 'Vui lòng thử lại sau.')}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-all"
          >
            <RefreshCw size={16} />
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
  )
}

function Header({ isFetching, onRefresh }: { isFetching: boolean; onRefresh: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
          <Activity size={15} />
          Bảng điều khiển quản trị chi nhánh
        </div>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
          Tổng quan vận hành sân
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Doanh thu đặt sân, tỉ lệ lấp đầy, khung giờ cao điểm và top sân doanh thu cao dựa trên dữ liệu thực tế.
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isFetching}
        style={{ backgroundColor: '#006d38' }}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
        Làm mới
      </button>
    </div>
  )
}

function KpiGrid({ data }: { data: AdminDashboardStats }) {
  const items = [
    {
      label: 'Doanh thu hôm nay',
      value: formatCurrency(data.todayRevenue),
      meta: `${numberFormatter.format(data.todayBookings)} lượt đặt`,
      icon: CircleDollarSign,
      tone: 'emerald',
    },
    {
      label: 'Doanh thu tháng này',
      value: formatCurrency(data.monthRevenue),
      meta: `${numberFormatter.format(data.monthBookings)} lượt đặt trong tháng`,
      icon: WalletCards,
      tone: 'sky',
    },
    {
      label: 'Tỉ lệ lấp đầy sân',
      value: `${formatPercent(data.occupancyRate)}`,
      meta: `${numberFormatter.format(data.bookedSlotsLast30Days)} / ${numberFormatter.format(data.availableSlotsLast30Days)} slot trong 30 ngày`,
      icon: BarChart3,
      tone: 'amber',
    },
    {
      label: 'Quy mô vận hành',
      value: `${numberFormatter.format(data.activeCourtCount)} sân`,
      meta: `${numberFormatter.format(data.activeBranchCount)} chi nhánh đang hoạt động`,
      icon: Building2,
      tone: 'violet',
    },
  ] as const

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, meta, icon: Icon, tone }) => (
        <div key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div>
              <div className="mt-3 text-2xl font-black text-slate-900">{value}</div>
            </div>
            <div className={iconClassName(tone)}>
              <Icon size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
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
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
      <PanelTitle
        icon={CalendarDays}
        title="Doanh thu 14 ngày gần nhất"
        description="Tổng doanh thu từ các đơn đặt sân đã xác nhận, đã check-in hoặc hoàn thành."
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
            <div key={item.date} className="rounded-xl bg-slate-50 px-2.5 py-2 text-center">
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
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
      <PanelTitle
        icon={BarChart3}
        title="Tỉ lệ lấp đầy sân"
        description="Tính toán dựa trên các khung giờ khả dụng trong 30 ngày qua."
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
            <span className="text-3xl font-black text-slate-900">{formatPercent(data.occupancyRate)}</span>
            <span className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">Lấp đầy</span>
          </div>
        </div>
        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <MiniMetric label="Slot đã đặt" value={numberFormatter.format(data.bookedSlotsLast30Days)} />
          <MiniMetric label="Tổng công suất slot" value={numberFormatter.format(data.availableSlotsLast30Days)} />
          <MiniMetric label="Doanh thu năm" value={formatCompactCurrency(data.yearRevenue)} />
          <MiniMetric label="Lượt đặt tháng" value={numberFormatter.format(data.monthBookings)} />
        </div>
      </div>
    </section>
  )
}

function PeakHoursPanel({ data }: { data: AdminPeakHourPoint[] }) {
  const maxSlots = Math.max(...data.map((item) => item.bookedSlots), 1)

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
      <PanelTitle
        icon={Clock3}
        title="Khung giờ cao điểm"
        description="Số lượng slot đã được đặt phân theo từng khung giờ."
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
                <div className="pointer-events-none absolute bottom-full mb-2 hidden min-w-32 rounded-lg bg-slate-950 px-3 py-2 text-center text-xs font-semibold text-white shadow-xl group-hover:block">
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
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
      <PanelTitle
        icon={Trophy}
        title="Top Sân doanh thu cao nhất"
        description="Xếp hạng theo doanh thu đặt sân trong năm hiện tại."
      />
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200/80">
        {data.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center bg-slate-50 text-center">
            <Trophy size={38} className="text-slate-300" />
            <div className="mt-3 text-sm font-bold text-slate-700">Chưa có doanh thu đặt sân</div>
            <div className="mt-1 text-xs text-slate-500">Danh sách top sân sẽ xuất hiện sau khi có đơn đặt được xác nhận.</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Sân đấu</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Slot</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.map((row, index) => (
                <tr key={row.courtId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-slate-900">{row.courtName}</div>
                        <div className="truncate text-xs font-medium text-slate-500">{row.branchName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-semibold text-slate-700">
                    {numberFormatter.format(row.bookedSlots)}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-black text-slate-900">
                    {formatCurrency(row.revenue)}
                    <div className="text-xs font-medium text-slate-400">
                      {numberFormatter.format(row.bookingCount)} lượt đặt
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
