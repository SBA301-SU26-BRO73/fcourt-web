import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { UserPlus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { SearchInput } from '@/components/ui/search-input'
import { Button } from '@/components/ui/button'
import { StaffTable } from './components/staff-table'
import { StaffFormModal } from './components/staff-form-modal'
import { useBranchStaff, useSetStaffActive } from '@/hooks/use-admin-staff'
import { getBranches } from '@/services/branch/branch.api'
import type { StaffResponse } from '@/types/staff'
import { getApiErrorMessage } from '@/common/utils/api-error'

type StatusFilter = 'all' | 'active' | 'inactive'

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
]

export function StaffPage() {
  const [page, setPage] = useState(0)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffResponse | null>(null)
  const [disabling, setDisabling] = useState<StaffResponse | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)

  const PAGE_SIZE = 20
  // Staff per branch is small; the whole branch is fetched once so search,
  // status counts and pagination all stay consistent client-side.

  // Branches this admin owns — the picker replaces the old hardcoded branch id.
  const { data: branchPage } = useQuery({
    queryKey: ['admin-branches-for-staff-picker'],
    queryFn: () => getBranches({ page: 0, size: 100, sortField: 'name', sortDirection: 'asc' }),
  })
  const branches = branchPage?.content ?? []
  // Fall back to the first loaded branch until the admin picks one explicitly.
  const branchId = selectedBranchId ?? branches[0]?.id ?? null

  const { data, isLoading, refetch } = useBranchStaff(branchId)

  const allStaff = data ?? []
  const totalElements = allStaff.length
  const branchNames = Object.fromEntries(branches.map((b) => [b.id, b.name]))

  const activeMutation = useSetStaffActive()

  function setActive(staff: StaffResponse, active: boolean) {
    setActionError(null)
    activeMutation.mutate(
      { id: staff.id, active },
      {
        onSuccess: () => setDisabling(null),
        onError: (error) => {
          setDisabling(null)
          setActionError(
            getApiErrorMessage(error, active ? 'Không thể kích hoạt lại nhân viên.' : 'Không thể vô hiệu hoá nhân viên.'),
          )
        },
      },
    )
  }

  // Client-side filter (search + status) over the full branch list
  const filtered = allStaff.filter((s) => {
    if (statusFilter === 'active' && !s.active) return false
    if (statusFilter === 'inactive' && s.active) return false
    if (!q.trim()) return true
    const t = q.toLowerCase()
    return s.email.toLowerCase().includes(t) || s.fullName.toLowerCase().includes(t) || String(s.id).includes(t)
  })

  // Paginate the filtered set client-side
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  function countByStatus(status: 'active' | 'inactive') {
    return allStaff.filter((s) => s.active === (status === 'active')).length
  }

  function changeStatusFilter(next: StatusFilter) {
    setStatusFilter(next)
    setPage(0)
  }

  function changeQuery(next: string) {
    setQ(next)
    setPage(0)
  }

  function handleEdit(s: StaffResponse) {
    setEditingStaff(s)
    setShowForm(true)
  }

  function handleCloseForm() {
    setShowForm(false)
    setEditingStaff(null)
  }

  const startRow = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1
  const endRow = Math.min((safePage + 1) * PAGE_SIZE, filtered.length)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý tài khoản nhân viên</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý tài khoản và phân quyền nhân viên chi nhánh · {totalElements} tài khoản
          </p>
        </div>
        <div className="flex items-center gap-2">
          {branches.length > 0 && (
            <select
              value={branchId ?? ''}
              onChange={(e) => setSelectedBranchId(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
          <Button
            icon={<RefreshCw size={14} />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Làm mới
          </Button>
          <Button
            variant="primary"
            icon={<UserPlus size={15} className="text-white stroke-[2.5]" />}
            disabled={branchId == null}
            className="bg-[#006d38] hover:bg-[#00552b] text-white font-bold px-4 py-2.5 rounded-xl shadow-sm"
            onClick={() => {
              setEditingStaff(null)
              setShowForm(true)
            }}
          >
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {actionError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {actionError}
        </div>
      )}

      {/* Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
          <SearchInput
            value={q}
            onChange={changeQuery}
            placeholder="Tìm theo tên hoặc email…"
          />

          {/* Segmented status filter */}
          <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {STATUS_TABS.map((tab) => {
              const count =
                tab.id === 'all'
                  ? allStaff.length
                  : countByStatus(tab.id)
              return (
                <button
                  key={tab.id}
                  onClick={() => changeStatusFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === tab.id
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                  <span className="text-slate-400">{count}</span>
                </button>
              )
            })}
          </div>

          <span className="ml-auto font-mono text-xs text-slate-400">
            {filtered.length} / {allStaff.length}
          </span>
        </div>

        {/* Table */}
        <StaffTable
          staff={pageRows}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDisable={setDisabling}
          onReactivate={(staff) => setActive(staff, true)}
          branchNames={branchNames}
          onAdd={() => {
            setEditingStaff(null)
            setShowForm(true)
          }}
        />

        {/* Pagination */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <span>
              Hiển thị {startRow}–{endRow} / {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="rounded-md border border-slate-200 p-1 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="font-mono">
                {safePage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                className="rounded-md border border-slate-200 p-1 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && branchId != null && (
        <StaffFormModal
          mode={editingStaff ? 'edit' : 'create'}
          initial={editingStaff ?? undefined}
          branchId={branchId}
          branchName={branchNames[branchId]}
          onClose={handleCloseForm}
        />
      )}

      {/* Delete confirmation */}
      {disabling !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="font-semibold text-slate-900">Vô hiệu hoá nhân viên</h3>
            <p className="mt-1.5 text-sm text-slate-500">
              {disabling.fullName || disabling.email} sẽ không thể đăng nhập nữa. Bạn có thể kích hoạt lại bất cứ lúc nào.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button onClick={() => setDisabling(null)}>Huỷ</Button>
              <Button
                variant="danger"
                disabled={activeMutation.isPending}
                onClick={() => setActive(disabling, false)}
              >
                {activeMutation.isPending ? 'Đang xử lý…' : 'Vô hiệu hoá'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
