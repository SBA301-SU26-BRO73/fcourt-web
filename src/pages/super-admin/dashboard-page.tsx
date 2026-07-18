import { Clock, Layers, Tag, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useCourtTypes } from '@/hooks/use-court-types'
import { usePlans } from '@/hooks/use-subscription-plans'
import { useUsers } from '@/hooks/use-users'
import type { UserAdminItem } from '@/types/admin'

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  foot,
}: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
  value: number | string
  foot?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={19} className={iconColor} />
        </span>
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-0.5">{value}</div>
      <div className="text-[13px] text-slate-500 font-medium">{label}</div>
      {foot && <div className="text-[12px] text-slate-400 mt-1">{foot}</div>}
    </div>
  )
}

function PendingRow({ item, onClick }: { item: UserAdminItem; onClick: () => void }) {
  const initials = (item.fullName ?? item.email)
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors"
    >
      <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold text-slate-800 truncate">
          {item.fullName ?? '—'}
        </div>
        <div className="text-[12px] text-slate-400 truncate">{item.email}</div>
      </div>
      <div className="text-[12px] text-slate-400 flex-shrink-0">
        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: usersData } = useUsers()
  const { data: courtTypesData } = useCourtTypes()
  const { data: plansData } = usePlans()

  const pending = usersData?.data?.content ?? []
  const courtTypeCount = courtTypesData?.data?.content.length ?? 0
  const planCount = plansData?.data?.content.length ?? 0

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Tổng quan</p>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          label="Chờ duyệt"
          value={pending.length}
          foot="Chủ sân đang chờ phê duyệt"
        />
        <StatCard
          icon={Layers}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          label="Loại sân"
          value={courtTypeCount}
          foot="Danh mục loại hình thể thao"
        />
        <StatCard
          icon={Tag}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          label="Gói đăng ký"
          value={planCount}
          foot="Gói dịch vụ cho chủ sân"
        />
        <StatCard
          icon={Users}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          label="Hệ thống"
          value="FCourt"
          foot="Super Admin đang hoạt động"
        />
      </div>

      {/* Pending preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">Đăng ký chờ duyệt</h2>
            <p className="text-[12.5px] text-slate-400 mt-0.5">
              {pending.length > 0 ? `${pending.length} chủ sân đang chờ phê duyệt` : 'Không có đăng ký nào chờ duyệt'}
            </p>
          </div>
          {pending.length > 0 && (
            <button
              onClick={() => navigate('/admin/pending')}
              className="px-3.5 py-1.5 rounded-xl text-[13px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition"
            >
              Xem tất cả
            </button>
          )}
        </div>
        {pending.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-[13.5px]">
            Tất cả hồ sơ đã được xử lý.
          </div>
        ) : (
          pending.slice(0, 5).map((item) => (
            <PendingRow key={item.id} item={item} onClick={() => navigate('/admin/pending')} />
          ))
        )}
      </div>
    </div>
  )
}
