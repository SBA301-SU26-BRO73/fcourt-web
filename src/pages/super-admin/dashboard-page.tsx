import type { ElementType, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import {
  BarChart3,
  Building2,
  CalendarCheck2,
  CircleDollarSign,
  Layers,
  RefreshCw,
  TrendingUp,
  X,
} from 'lucide-react'

import {
  useSuperAdminDashboard,
  useSuperAdminDashboardDetails,
} from '@/hooks/use-super-admin-dashboard'
import type {
  DashboardBranchRow,
  DashboardCourtRow,
  DashboardSubscriptionRow,
  PlanSalesRow,
  RevenuePoint,
} from '@/services/super_admin/super-admin-dashboard.service'

type DetailModal = 'revenue' | 'branches' | 'courts' | 'subscriptions'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatMonth(month: string) {
  const [year, monthIndex] = month.split('-').map(Number)
  return new Intl.DateTimeFormat('vi-VN', {
    month: 'short',
    year: '2-digit',
  }).format(new Date(year, monthIndex - 1, 1))
}

function StatCard({
  icon: Icon,
  gradient,
  label,
  value,
  foot,
  onClick,
}: {
  icon: ElementType
  gradient: string
  label: string
  value: number | string
  foot?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group min-h-[178px] rounded-[20px] bg-white p-5 text-left shadow-[0_2px_8px_rgba(15,23,42,0.05)] ring-1 ring-slate-100 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,23,42,0.10)] focus:outline-none focus:ring-2 focus:ring-emerald-400"
    >
      <div className="mb-5 flex items-start justify-between">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg shadow-slate-200/70 transition group-hover:scale-105`}
        >
          <Icon size={21} className="text-white" />
        </span>
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-400 transition group-hover:bg-emerald-50 group-hover:text-emerald-600">
          Chi tiết
        </span>
      </div>
      <div className="mb-1 text-[28px] font-extrabold leading-tight text-slate-900">{value}</div>
      <div className="text-[13px] font-semibold text-slate-500">{label}</div>
      {foot && <div className="mt-2 text-[12px] font-medium text-slate-400">{foot}</div>}
    </button>
  )
}

function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1)

  return (
    <div className="rounded-[20px] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.05)] ring-1 ring-slate-100">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Doanh thu gói thành viên</h2>
          <p className="mt-1 text-[12.5px] font-medium text-slate-400">
            Tổng hợp lượt đăng ký và doanh thu theo tháng
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-100">
          <TrendingUp className="h-5 w-5 text-white" />
        </span>
      </div>

      <div className="relative flex h-72 items-end gap-4 border-b border-slate-100 pb-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[210px] bg-[linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[length:100%_52px]" />
        {data.map((item) => {
          const height = Math.max(10, Math.round((item.revenue / maxRevenue) * 210))
          return (
            <div key={item.month} className="group relative z-10 flex min-w-0 flex-1 flex-col items-center gap-3">
              <div className="flex h-[210px] w-full items-end justify-center">
                <div
                  className="relative w-full max-w-12 rounded-t-2xl bg-gradient-to-t from-emerald-600 via-emerald-400 to-cyan-300 shadow-[0_10px_24px_rgba(16,185,129,0.20)] transition duration-200 group-hover:scale-x-105 group-hover:shadow-[0_14px_30px_rgba(16,185,129,0.30)]"
                  style={{ height }}
                >
                  <div className="absolute -top-14 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-2xl bg-slate-900 px-3 py-2 text-[12px] font-bold text-white shadow-xl group-hover:block">
                    {formatCurrency(item.revenue)}
                    <div className="mt-0.5 text-center text-[10px] font-medium text-slate-300">
                      {item.subscriptions} lượt đăng ký
                    </div>
                    <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900" />
                  </div>
                </div>
              </div>
              <div className="text-center text-[11px] font-semibold text-slate-400">
                {formatMonth(item.month)}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {data.slice(-3).map((item) => (
          <div key={item.month} className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="text-[11px] font-semibold text-slate-400">{formatMonth(item.month)}</div>
            <div className="mt-1 text-[13px] font-extrabold text-slate-800">{formatCurrency(item.revenue)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SubscriptionRing({
  label,
  value,
  total,
  accent,
  foot,
}: {
  label: string
  value: number
  total: number
  accent: string
  foot: string
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div className="rounded-[20px] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.05)] ring-1 ring-slate-100 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,23,42,0.10)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[28px] font-extrabold leading-tight text-slate-900">{value}</div>
          <div className="mt-1 text-[13px] font-semibold text-slate-500">{label}</div>
          <div className="mt-2 text-[12px] font-medium text-slate-400">{foot}</div>
        </div>
        <div
          className="grid h-20 w-20 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(${accent} ${percentage * 3.6}deg, #eef2f7 0deg)`,
          }}
        >
          <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-[13px] font-extrabold text-slate-800 shadow-inner">
            {percentage}%
          </div>
        </div>
      </div>
    </div>
  )
}

function PlanRevenueTable({ rows }: { rows: PlanSalesRow[] }) {
  return (
    <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.05)] ring-1 ring-slate-100">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-base font-bold text-slate-900">Doanh thu theo gói thành viên</h2>
        <p className="mt-1 text-[12.5px] font-medium text-slate-400">
          Tổng hợp từ các gói thành viên do chủ sân đăng ký.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="grid place-items-center px-6 py-14 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-100 to-emerald-50 text-emerald-600 shadow-inner">
            <BarChart3 className="h-8 w-8" />
          </div>
          <div className="text-[14px] font-bold text-slate-700">Chưa có doanh thu gói thành viên.</div>
          <div className="mt-1 max-w-sm text-[12.5px] font-medium text-slate-400">
            Dữ liệu sẽ xuất hiện sau khi chủ sân đăng ký gói thành viên.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-6 py-4 font-bold">Gói thành viên</th>
                <th className="px-6 py-4 text-right font-bold">Đã bán</th>
                <th className="px-6 py-4 text-right font-bold">Còn hạn / Hết hạn</th>
                <th className="px-6 py-4 text-right font-bold">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.planId} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-6 py-4 font-bold text-slate-900">{row.planName}</td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-600">{row.soldCount}</td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-600">{row.activeCount} / {row.expiredCount}</td>
                  <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                    {formatCurrency(row.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function DetailModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
            <p className="mt-1 text-[13px] font-medium text-slate-400">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            aria-label="Đóng cửa sổ"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-auto p-6">{children}</div>
      </div>
    </div>
  )
}

function EmptyDetail({ label }: { label: string }) {
  return (
    <div className="grid place-items-center rounded-2xl bg-slate-50 px-6 py-12 text-center">
      <div className="text-sm font-bold text-slate-700">{label}</div>
    </div>
  )
}

function LoadingDetail() {
  return (
    <div className="grid place-items-center rounded-2xl bg-slate-50 px-6 py-12 text-center text-sm font-semibold text-slate-500">
      Đang tải chi tiết...
    </div>
  )
}

function RevenueDetail({ rows }: { rows: PlanSalesRow[] }) {
  if (rows.length === 0) return <EmptyDetail label="Chưa có doanh thu gói thành viên để hiển thị." />

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-slate-100">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead>
          <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="px-5 py-4 font-bold">Gói thành viên</th>
            <th className="px-5 py-4 text-right font-bold">Đã bán</th>
            <th className="px-5 py-4 text-right font-bold">Còn hạn / Hết hạn</th>
            <th className="px-5 py-4 text-right font-bold">Doanh thu</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.planId} className="border-t border-slate-100">
              <td className="px-5 py-4 font-bold text-slate-900">{row.planName}</td>
              <td className="px-5 py-4 text-right font-semibold text-slate-600">{row.soldCount}</td>
              <td className="px-5 py-4 text-right font-semibold text-slate-600">{row.activeCount} / {row.expiredCount}</td>
              <td className="px-5 py-4 text-right font-extrabold text-slate-900">{formatCurrency(row.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BranchDetail({ rows }: { rows: DashboardBranchRow[] }) {
  if (rows.length === 0) return <EmptyDetail label="Chưa có chi nhánh đang hoạt động." />

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-slate-100">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="px-5 py-4 font-bold">Chi nhánh</th>
            <th className="px-5 py-4 font-bold">Chủ sân</th>
            <th className="px-5 py-4 font-bold">Địa chỉ</th>
            <th className="px-5 py-4 font-bold">Giờ hoạt động</th>
            <th className="px-5 py-4 text-right font-bold">Khung giờ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-100 align-top">
              <td className="px-5 py-4">
                <div className="font-bold text-slate-900">{row.name}</div>
                <div className="mt-1 text-[12px] font-medium text-slate-400">{row.phone ?? 'Chưa có số điện thoại'}</div>
              </td>
              <td className="px-5 py-4">
                <div className="font-semibold text-slate-700">{row.adminName ?? 'Chưa cập nhật'}</div>
                <div className="mt-1 text-[12px] font-medium text-slate-400">{row.adminEmail}</div>
              </td>
              <td className="px-5 py-4 font-medium text-slate-600">{row.address}, {row.city}</td>
              <td className="px-5 py-4 font-semibold text-slate-600">{row.openTime} - {row.closeTime}</td>
              <td className="px-5 py-4 text-right font-bold text-slate-900">{row.slotDurationMinutes} phút</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CourtDetail({ rows }: { rows: DashboardCourtRow[] }) {
  if (rows.length === 0) return <EmptyDetail label="Chưa có sân nào." />

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-slate-100">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="px-5 py-4 font-bold">Sân</th>
            <th className="px-5 py-4 font-bold">Chi nhánh</th>
            <th className="px-5 py-4 font-bold">Loại sân</th>
            <th className="px-5 py-4 text-right font-bold">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-100">
              <td className="px-5 py-4 font-bold text-slate-900">{row.name}</td>
              <td className="px-5 py-4 font-semibold text-slate-600">{row.branchName}</td>
              <td className="px-5 py-4 font-medium text-slate-500">{row.courtTypeName}</td>
              <td className="px-5 py-4 text-right">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">
                  {{ ACTIVE: 'Hoạt động', INACTIVE: 'Ngừng hoạt động', MAINTENANCE: 'Bảo trì' }[row.status] ?? row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SubscriptionDetail({ rows }: { rows: DashboardSubscriptionRow[] }) {
  if (rows.length === 0) return <EmptyDetail label="Chưa có gói thành viên nào." />

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-slate-100">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="px-5 py-4 font-bold">Chủ sân</th>
            <th className="px-5 py-4 font-bold">Gói thành viên</th>
            <th className="px-5 py-4 font-bold">Thời hạn</th>
            <th className="px-5 py-4 text-right font-bold">Giới hạn</th>
            <th className="px-5 py-4 text-right font-bold">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-100 align-top">
              <td className="px-5 py-4">
                <div className="font-semibold text-slate-700">{row.adminName ?? 'Chưa cập nhật'}</div>
                <div className="mt-1 text-[12px] font-medium text-slate-400">{row.adminEmail}</div>
              </td>
              <td className="px-5 py-4 font-bold text-slate-900">{row.planName}</td>
              <td className="px-5 py-4 font-semibold text-slate-600">{row.startDate} - {row.endDate}</td>
              <td className="px-5 py-4 text-right font-medium text-slate-600">
                {row.maxBranches} chi nhánh / {row.maxCourts} sân
              </td>
              <td className="px-5 py-4 text-right">
                <span
                  className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                    row.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {row.status === 'ACTIVE' ? 'Còn hiệu lực' : 'Đã hết hạn'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DashboardPage() {
  const [activeModal, setActiveModal] = useState<DetailModal | null>(null)
  const { data, isLoading, isError, error, refetch, isFetching } = useSuperAdminDashboard()
  const {
    data: details,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
    error: detailsError,
  } = useSuperAdminDashboardDetails(activeModal !== null && activeModal !== 'revenue')

  const loading = isLoading
  const fetching = isFetching
  const hasError = isError
  const displayError = (error as Error)?.message
  const subscriptionTotal = (data?.activeSubscriptionCount ?? 0) + (data?.expiredSubscriptionCount ?? 0)
  const activeSubscriptions = useMemo(
    () => details?.subscriptions.filter((item) => item.status === 'ACTIVE') ?? [],
    [details],
  )
  const expiredSubscriptions = useMemo(
    () => details?.subscriptions.filter((item) => item.status === 'EXPIRED') ?? [],
    [details],
  )

  function renderModalContent() {
    if (!activeModal || !data) return null

    if (activeModal === 'revenue') {
      return (
        <DetailModalShell
          title="Chi tiết doanh thu gói thành viên"
          subtitle={`${data.planSales.reduce((total, plan) => total + plan.soldCount, 0)} lượt đăng ký, tổng cộng ${formatCurrency(data.totalSubscriptionRevenue)}`}
          onClose={() => setActiveModal(null)}
        >
          <RevenueDetail rows={data.planSales} />
        </DetailModalShell>
      )
    }

    if (isDetailsLoading) {
      return (
        <DetailModalShell
          title="Đang tải chi tiết"
          subtitle="Hệ thống đang lấy dữ liệu mới nhất từ máy chủ."
          onClose={() => setActiveModal(null)}
        >
          <LoadingDetail />
        </DetailModalShell>
      )
    }

    if (isDetailsError || !details) {
      return (
        <DetailModalShell
          title="Không thể tải chi tiết"
          subtitle={(detailsError as Error)?.message || 'Vui lòng thử lại sau.'}
          onClose={() => setActiveModal(null)}
        >
          <EmptyDetail label="Không thể tải dữ liệu chi tiết." />
        </DetailModalShell>
      )
    }

    if (activeModal === 'branches') {
      return (
        <DetailModalShell
          title="Chi nhánh đang hoạt động"
          subtitle={`${details.activeBranches.length} chi nhánh đang hoạt động`}
          onClose={() => setActiveModal(null)}
        >
          <BranchDetail rows={details.activeBranches} />
        </DetailModalShell>
      )
    }

    if (activeModal === 'courts') {
      return (
        <DetailModalShell
          title="Danh sách sân"
          subtitle={`${details.courts.length} sân hiện có trong hệ thống`}
          onClose={() => setActiveModal(null)}
        >
          <CourtDetail rows={details.courts} />
        </DetailModalShell>
      )
    }

    return (
      <DetailModalShell
        title="Chi tiết gói thành viên"
        subtitle={`${activeSubscriptions.length} còn hiệu lực / ${expiredSubscriptions.length} đã hết hạn`}
        onClose={() => setActiveModal(null)}
      >
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-extrabold text-slate-900">Còn hiệu lực</h3>
            <SubscriptionDetail rows={activeSubscriptions} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-extrabold text-slate-900">Đã hết hạn</h3>
            <SubscriptionDetail rows={expiredSubscriptions} />
          </div>
        </div>
      </DetailModalShell>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[12px] font-bold uppercase tracking-widest text-slate-400">
            Tổng quan
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Bảng điều khiển Super Admin</h1>
        </div>
        <button
          onClick={() => {
            refetch()
          }}
          disabled={fetching}
          style={{ backgroundColor: '#006d38' }}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 text-white ${fetching ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {loading && (
        <div className="rounded-[20px] bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-[0_2px_8px_rgba(15,23,42,0.05)] ring-1 ring-slate-100">
          Đang tải số liệu tổng quan...
        </div>
      )}

      {hasError && (
        <div className="rounded-[20px] bg-red-50 p-5 text-sm font-semibold text-red-700 shadow-[0_2px_8px_rgba(15,23,42,0.05)] ring-1 ring-red-100">
          {displayError || 'Không thể tải bảng điều khiển.'}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={CircleDollarSign}
              gradient="from-emerald-400 to-teal-600"
              label="Doanh thu gói thành viên"
              value={formatCurrency(data.totalSubscriptionRevenue)}
              foot={`${data.planSales.reduce((total, plan) => total + plan.soldCount, 0)} lượt đăng ký gói`}
              onClick={() => setActiveModal('revenue')}
            />
            <StatCard
              icon={Building2}
              gradient="from-sky-400 to-blue-600"
              label="Chi nhánh hoạt động"
              value={data.activeBranchCount}
              foot="Chi nhánh đang vận hành"
              onClick={() => setActiveModal('branches')}
            />
            <StatCard
              icon={Layers}
              gradient="from-violet-400 to-purple-600"
              label="Tổng số sân"
              value={data.totalCourtCount}
              foot="Sân hiện có trong hệ thống"
              onClick={() => setActiveModal('courts')}
            />
            <StatCard
              icon={CalendarCheck2}
              gradient="from-amber-400 to-orange-600"
              label="Gói còn hạn / hết hạn"
              value={`${data.activeSubscriptionCount} / ${data.expiredSubscriptionCount}`}
              foot={`${data.newSubscriptionsThisMonth} lượt đăng ký mới trong tháng`}
              onClick={() => setActiveModal('subscriptions')}
            />
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
            <RevenueChart data={data.revenueChart} />
            <div className="grid gap-6">
              <SubscriptionRing
                label="Gói còn hiệu lực"
                value={data.activeSubscriptionCount}
                total={subscriptionTotal}
                accent="#10b981"
                foot="Ngày hết hạn từ hôm nay trở đi"
              />
              <SubscriptionRing
                label="Gói đã hết hạn"
                value={data.expiredSubscriptionCount}
                total={subscriptionTotal}
                accent="#f59e0b"
                foot="Ngày hết hạn trước hôm nay"
              />
            </div>
          </div>

          <PlanRevenueTable rows={data.planSales} />
        </>
      )}
      {renderModalContent()}
    </div>
  )
}
