import { Edit, Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { StaffResponse, UserStatus } from '@/types/staff'

function statusTone(status: UserStatus) {
  if (status === 'ACTIVE') return 'green' as const
  if (status === 'LOCKED') return 'red' as const
  return 'gray' as const
}

function statusLabel(status: UserStatus) {
  const map: Record<UserStatus, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    LOCKED: 'Locked',
    PENDING_APPROVAL: 'Pending',
  }
  return map[status]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

interface StaffTableProps {
  staff: StaffResponse[]
  isLoading: boolean
  onEdit: (s: StaffResponse) => void
  onDelete: (id: number) => void
  onAdd: () => void
}

export function StaffTable({
  staff,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: StaffTableProps) {
  if (isLoading) {
    return (
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-48 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (staff.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-slate-700">Chưa có nhân viên nào</p>
          <p className="mt-1 text-sm text-slate-400">
            Thêm nhân viên để họ có thể check-in và xử lý walk-in booking.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Thêm nhân viên đầu tiên
        </button>
      </div>
    )
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
          <th className="px-4 py-3">Nhân viên</th>
          <th className="px-4 py-3">Liên hệ</th>
          <th className="px-4 py-3">Chi nhánh</th>
          <th className="px-4 py-3">Trạng thái</th>
          <th className="px-4 py-3">Ngày tạo</th>
          <th className="px-4 py-3">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {staff.map((s) => (
          <tr key={s.id} className="hover:bg-slate-50/60">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar email={s.email} size={36} />
                <div>
                  <div className="font-medium text-slate-800">{s.email.split('@')[0]}</div>
                  <div className="font-mono text-xs text-slate-400">#{s.id}</div>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-700">{s.email}</span>
                <span className="font-mono text-xs text-slate-400">
                  {s.phone ?? '—'}
                </span>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-600">{s.branchName}</td>
            <td className="px-4 py-3">
              <Badge tone={statusTone(s.userStatus)}>
                {statusLabel(s.userStatus)}
              </Badge>
            </td>
            <td className="px-4 py-3 font-mono text-xs text-slate-400">
              {formatDate(s.createdAt)}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1">
                <button
                  title="Chỉnh sửa"
                  onClick={() => onEdit(s)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <Edit size={15} />
                </button>
                <button
                  title="Xoá"
                  onClick={() => onDelete(s.id)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
