import { useEffect, useMemo, useRef, useState } from 'react'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  Clock,
  Clock3,
  Eye,
  MapPin,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { deleteBranch, getBranches } from '@/services/branch/branch.api'
import { deleteCourt, getCourts } from '@/services/court/court.api'
import type { Branch, BranchSortField, SortDirection } from '@/types/branch'
import type { Court } from '@/types/court'
import { getBranchErrorMessage } from './branch-error.utils'
import { getCourtErrorMessage } from '@/pages/courts/court-error.utils'

const sortOptions: Array<{ value: BranchSortField; label: string }> = [
  { value: 'name', label: 'Tên cơ sở' },
  { value: 'city', label: 'Thành phố' },
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'updatedAt', label: 'Ngày cập nhật' },
]

type LocationState = {
  successMessage?: string
  selectedBranchId?: number
  focusCourtId?: number
} | null

function formatTime(time: string) {
  return time.slice(0, 5)
}

function formatAddress(branch: Branch) {
  return [branch.address, branch.ward, branch.city].filter(Boolean).join(', ')
}

export function BranchListPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const successMessage = (location.state as LocationState)?.successMessage
  const focusCourtId = (location.state as LocationState)?.focusCourtId
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [sortField, setSortField] = useState<BranchSortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(
    (location.state as LocationState)?.selectedBranchId ?? null,
  )
  const [courtPendingDelete, setCourtPendingDelete] = useState<Court | null>(null)

  const branchQuery = useQuery({
    queryKey: ['branches', 'list', page, size, sortField, sortDirection],
    queryFn: () => getBranches({ page, size, sortField, sortDirection }),
    placeholderData: keepPreviousData,
  })

  const courtQuery = useQuery({
    queryKey: ['courts', 'branch-management-list'],
    queryFn: () =>
      getCourts({
        page: 0,
        size: 1000,
        sortField: 'name',
        sortDirection: 'asc',
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBranch,
    onSuccess: async (_, deletedBranchId) => {
      if (selectedBranchId === deletedBranchId) setSelectedBranchId(null)
      if (branchQuery.data?.numberOfElements === 1 && page > 0) {
        setPage((current) => current - 1)
      }
      await queryClient.invalidateQueries({ queryKey: ['branches'] })
    },
  })

  const courtDeleteMutation = useMutation({
    mutationFn: deleteCourt,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['courts'] })
      navigate(location.pathname, {
        replace: true,
        state: {
          successMessage: 'Xóa sân thành công.',
          selectedBranchId: effectiveSelectedBranchId,
        },
      })
    },
  })

  function handleDelete(branch: Branch) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa cơ sở "${branch.name}" không?`,
    )
    if (confirmed) deleteMutation.mutate(branch.id)
  }

  function handleCourtDelete(court: Court) {
    setCourtPendingDelete(court)
  }

  function confirmCourtDelete() {
    if (!courtPendingDelete) return
    courtDeleteMutation.mutate(courtPendingDelete.id, {
      onSuccess: () => setCourtPendingDelete(null),
    })
  }

  useEffect(() => {
    if (!successMessage) return
    const timeoutId = window.setTimeout(() => {
      navigate(location.pathname, { replace: true, state: null })
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [location.pathname, navigate, successMessage])

  const data = branchQuery.data

  const filteredBranches = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('vi')
    if (!normalizedSearch) return data?.content ?? []

    return (data?.content ?? []).filter((branch) =>
      [branch.name, branch.address, branch.ward, branch.city].some((value) =>
        value?.toLocaleLowerCase('vi').includes(normalizedSearch),
      ),
    )
  }, [data, searchTerm])

  const selectedBranch =
    data?.content.find((branch) => branch.id === selectedBranchId) ?? data?.content[0]
  const effectiveSelectedBranchId = selectedBranch?.id ?? null
  const allCourts = courtQuery.data?.content ?? []
  const courts = selectedBranch
    ? allCourts.filter((court) => court.branchId === selectedBranch.id)
    : []

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#111827]">
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[32px] font-bold tracking-tight">Quản lý cơ sở</h1>
          <Link
            to="/admin/courts"
            className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-bold text-[#059669] hover:border-[#10B981] hover:bg-emerald-50"
          >
            Quản lý sân
          </Link>
        </div>

        {successMessage && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          >
            {successMessage}
          </div>
        )}

        {deleteMutation.isError && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            {getBranchErrorMessage(deleteMutation.error)}
          </div>
        )}

        {courtDeleteMutation.isError && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            {getCourtErrorMessage(courtDeleteMutation.error)}
          </div>
        )}

        <section aria-label="Tìm kiếm và chọn cơ sở" className="mt-6">
          <div className="flex items-center gap-3">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Tìm kiếm cơ sở</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#6B7280]"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm kiếm cơ sở..."
                className="h-12 w-full rounded-xl border border-[#E5E7EB] bg-white pl-12 pr-4 text-sm outline-none transition duration-200 placeholder:text-[#9CA3AF] focus:border-[#10B981] focus:ring-4 focus:ring-emerald-100"
              />
            </label>
            <button
              type="button"
              aria-label="Mở bộ lọc"
              aria-expanded={showFilters}
              onClick={() => setShowFilters((current) => !current)}
              className={`grid size-12 shrink-0 place-items-center rounded-xl border bg-white transition duration-200 hover:border-[#10B981] hover:text-[#059669] ${
                showFilters
                  ? 'border-[#10B981] text-[#059669] shadow-sm'
                  : 'border-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              <SlidersHorizontal aria-hidden="true" className="size-5" />
            </button>
            <Link
              to="/admin/branches/new"
              aria-label="Thêm cơ sở"
              className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#10B981] text-white shadow-sm transition duration-200 hover:bg-[#059669] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
            >
              <Plus aria-hidden="true" className="size-6" />
            </Link>
          </div>

          {showFilters && (
            <div className="mt-3 grid gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:grid-cols-3">
              <FilterSelect
                label="Sắp xếp theo"
                value={sortField}
                onChange={(value) => {
                  setSortField(value as BranchSortField)
                  setPage(0)
                }}
                options={sortOptions}
              />
              <FilterSelect
                label="Thứ tự"
                value={sortDirection}
                onChange={(value) => {
                  setSortDirection(value as SortDirection)
                  setPage(0)
                }}
                options={[
                  { value: 'asc', label: 'Tăng dần' },
                  { value: 'desc', label: 'Giảm dần' },
                ]}
              />
              <FilterSelect
                label="Số cơ sở mỗi trang"
                value={String(size)}
                onChange={(value) => {
                  setSize(Number(value))
                  setPage(0)
                }}
                options={[5, 10, 20, 50].map((value) => ({
                  value: String(value),
                  label: String(value),
                }))}
              />
            </div>
          )}

          {branchQuery.isPending ? (
            <StatePanel title="Đang tải danh sách cơ sở..." />
          ) : branchQuery.isError ? (
            <StatePanel
              title="Không thể tải danh sách cơ sở"
              description={getBranchErrorMessage(branchQuery.error)}
              actionLabel="Thử lại"
              onAction={() => void branchQuery.refetch()}
            />
          ) : !data || data.content.length === 0 ? (
            <StatePanel
              title="Chưa có cơ sở đang hoạt động"
              description="Thêm cơ sở đầu tiên để bắt đầu quản lý."
            />
          ) : filteredBranches.length === 0 ? (
            <StatePanel
              title="Không tìm thấy cơ sở"
              description="Hãy thử một tên hoặc địa chỉ khác."
            />
          ) : (
            <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-3 pt-1">
              {filteredBranches.map((branch) => {
                const isSelected = branch.id === effectiveSelectedBranchId
                const isDeleting =
                  deleteMutation.isPending && deleteMutation.variables === branch.id
                return (
                  <article
                    key={branch.id}
                    className={`relative min-w-40 snap-start overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected ? 'border-[#10B981]' : 'border-transparent'
                    }`}
                  >
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedBranchId(branch.id)}
                      className="block w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-emerald-200"
                    >
                      <div className="px-4 py-3 pr-12">
                        <p className="truncate text-lg font-bold">{branch.name}</p>
                        <p className="mt-1 text-sm text-[#6B7280]">
                          {allCourts.filter((court) => court.branchId === branch.id).length} sân
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      aria-label={`Xóa cơ sở ${branch.name}`}
                      title="Xóa cơ sở"
                      disabled={deleteMutation.isPending}
                      onClick={() => handleDelete(branch)}
                      className="absolute bottom-3 right-3 z-10 grid size-8 place-items-center rounded-full text-red-500 transition duration-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2
                        aria-hidden="true"
                        className={`size-4 ${isDeleting ? 'animate-pulse' : ''}`}
                      />
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {selectedBranch && (
          <>
            <BranchDetailCard branch={selectedBranch} courtCount={courts.length} />
            <CourtList
              key={selectedBranch.id}
              branchId={selectedBranch.id}
              focusCourtId={focusCourtId}
              courts={courts}
              isLoading={courtQuery.isPending}
              error={courtQuery.error}
              onRetry={() => void courtQuery.refetch()}
              isDeleting={courtDeleteMutation.isPending}
              onDelete={handleCourtDelete}
            />
          </>
        )}

        {data && data.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between gap-3 text-sm text-[#6B7280]">
            <button
              type="button"
              disabled={data.first || branchQuery.isFetching}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 font-semibold text-[#111827] hover:border-[#10B981] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trang trước
            </button>
            <span className="font-medium">
              Trang {data.number + 1}/{data.totalPages}
            </span>
            <button
              type="button"
              disabled={data.last || branchQuery.isFetching}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 font-semibold text-[#111827] hover:border-[#10B981] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Trang sau
            </button>
          </div>
        )}
      </main>

      {courtPendingDelete && (
        <DeleteCourtDialog
          court={courtPendingDelete}
          isDeleting={courtDeleteMutation.isPending}
          onCancel={() => setCourtPendingDelete(null)}
          onConfirm={confirmCourtDelete}
        />
      )}

    </div>
  )
}

type BranchDetailCardProps = {
  branch: Branch
  courtCount: number
}

function BranchDetailCard({ branch, courtCount }: BranchDetailCardProps) {
  return (
    <section className="relative mt-7 rounded-[20px] border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
      <Link
        to={`/admin/branches/${branch.id}/edit`}
        aria-label={`Chỉnh sửa ${branch.name}`}
        className="absolute right-5 top-5 grid size-10 place-items-center rounded-full text-[#6B7280] transition duration-200 hover:bg-emerald-50 hover:text-[#059669] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
      >
        <Pencil aria-hidden="true" className="size-5" />
      </Link>
      <h2 className="pr-14 text-[28px] font-bold tracking-tight">{branch.name}</h2>
      <div className="mt-5 space-y-3 text-sm text-[#6B7280] sm:text-base">
        <p className="flex items-start gap-3">
          <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#10B981]" />
          <span>{formatAddress(branch)}</span>
        </p>
        <p className="flex items-center gap-3">
          <Clock aria-hidden="true" className="size-5 shrink-0 text-[#10B981]" />
          <span>
            {formatTime(branch.openTime)} - {formatTime(branch.closeTime)}
          </span>
        </p>
      </div>
      <div className="my-6 h-px bg-[#E5E7EB]" />
      <div className="flex items-center gap-4 text-sm">
        <span className="rounded-full bg-[#E5E7EB] px-3 py-1.5 font-semibold text-[#6B7280]">
          {branch.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm đóng'}
        </span>
        <span className="text-[#6B7280]">{courtCount} sân</span>
      </div>
    </section>
  )
}

type CourtListProps = {
  branchId: number
  focusCourtId?: number
  courts: Court[]
  isLoading: boolean
  error: unknown
  isDeleting: boolean
  onRetry: () => void
  onDelete: (court: Court) => void
}

const courtStatusLabels = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Ngừng hoạt động',
  MAINTENANCE: 'Bảo trì',
} as const

const courtStatusStyles = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-slate-200 text-slate-700',
  MAINTENANCE: 'bg-amber-100 text-amber-800',
} as const

function CourtList({
  branchId,
  focusCourtId,
  courts,
  isLoading,
  error,
  isDeleting,
  onRetry,
  onDelete,
}: CourtListProps) {
  const focusedCourtIndex = focusCourtId
    ? courts.findIndex((court) => court.id === focusCourtId)
    : -1
  const [visibleCount, setVisibleCount] = useState(10)
  const focusedCourtVisibleCount =
    focusedCourtIndex >= 0 ? Math.ceil((focusedCourtIndex + 1) / 10) * 10 : 10
  const effectiveVisibleCount = Math.max(visibleCount, focusedCourtVisibleCount)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const visibleCourts = courts.slice(0, effectiveVisibleCount)
  const hasMore = effectiveVisibleCount < courts.length

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((current) =>
            Math.min(Math.max(current, effectiveVisibleCount) + 10, courts.length),
          )
        }
      },
      { rootMargin: '160px 0px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [courts.length, effectiveVisibleCount, hasMore])

  useEffect(() => {
    if (!focusCourtId) return
    document.getElementById(`branch-court-${focusCourtId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [courts.length, focusCourtId])

  return (
    <section className="mt-8" aria-labelledby="court-list-title">
      <div className="flex items-center justify-between gap-4">
        <h2 id="court-list-title" className="text-2xl font-bold">
          Danh sách sân ({courts.length})
        </h2>
        <Link
          to="/admin/courts/new"
          state={{ returnTo: '/admin/branches', selectedBranchId: branchId }}
          aria-label="Thêm sân"
          className="shrink-0 rounded-lg px-2 py-2 text-sm font-bold text-[#10B981] transition duration-200 hover:bg-emerald-50 hover:text-[#059669]"
        >
          + Thêm sân
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-white px-6 py-12 text-center shadow-sm">
          <p className="font-semibold text-[#111827]">Đang tải danh sách sân...</p>
        </div>
      ) : error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="font-semibold text-red-800">Không thể tải danh sách sân</p>
          <p className="mt-1 text-sm text-red-700">{getCourtErrorMessage(error)}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800"
          >
            Thử lại
          </button>
        </div>
      ) : courts.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[#D1D5DB] bg-white px-6 py-12 text-center">
          <p className="font-semibold text-[#111827]">Chưa có dữ liệu sân</p>
          <p className="mt-1 text-sm text-[#6B7280]">
            Branch này chưa có sân nào.
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-[#E5E7EB] rounded-2xl bg-white px-5 shadow-sm">
          {visibleCourts.map((court) => (
            <article
              id={`branch-court-${court.id}`}
              key={court.id}
              className="flex scroll-mt-6 items-center gap-4 py-6"
            >
              {court.imageUrl ? (
                <img
                  src={court.imageUrl}
                  alt={court.name}
                  className="size-16 shrink-0 rounded-xl bg-slate-100 object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-emerald-50 text-lg font-black text-emerald-600">
                  {court.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{court.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${courtStatusStyles[court.status]}`}
                  >
                    {courtStatusLabels[court.status]}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs text-[#6B7280]">
                    {court.courtTypeName}
                  </span>
                  {court.description && (
                    <span className="max-w-md truncate text-sm text-[#6B7280]">
                      {court.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  to="/admin/time-slots"
                  state={{
                    courtId: court.id,
                    returnTo: '/admin/branches',
                    returnState: { selectedBranchId: branchId, focusCourtId: court.id },
                  }}
                  aria-label={`Quản lý khung giờ ${court.name}`}
                  title="Quản lý khung giờ"
                  className="grid size-10 place-items-center rounded-full text-[#6B7280] hover:bg-emerald-50 hover:text-[#059669]"
                >
                  <Clock3 aria-hidden="true" className="size-5" />
                </Link>
                <Link
                  to={`/admin/courts/${court.id}`}
                  state={{
                    returnTo: '/admin/branches',
                    selectedBranchId: branchId,
                    focusCourtId: court.id,
                  }}
                  aria-label={`Xem chi tiết ${court.name}`}
                  title="Xem chi tiết"
                  className="grid size-10 place-items-center rounded-full text-[#6B7280] hover:bg-emerald-50 hover:text-[#059669]"
                >
                  <Eye aria-hidden="true" className="size-5" />
                </Link>
                <Link
                  to={`/admin/courts/${court.id}/edit`}
                  state={{
                    returnTo: '/admin/branches',
                    selectedBranchId: branchId,
                    focusCourtId: court.id,
                  }}
                  aria-label={`Chỉnh sửa ${court.name}`}
                  title="Chỉnh sửa"
                  className="grid size-10 place-items-center rounded-full text-[#6B7280] hover:bg-emerald-50 hover:text-[#059669]"
                >
                  <Pencil aria-hidden="true" className="size-5" />
                </Link>
                <button
                type="button"
                  aria-label={`Xóa ${court.name}`}
                  title="Xóa sân"
                  disabled={isDeleting}
                  onClick={() => onDelete(court)}
                  className="grid size-10 place-items-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 aria-hidden="true" className="size-5" />
                </button>
              </div>
            </article>
          ))}
          {hasMore && (
            <div
              ref={loadMoreRef}
              className="py-5 text-center text-sm font-medium text-[#6B7280]"
            >
              Cuộn xuống để tải thêm sân...
            </div>
          )}
        </div>
      )}
    </section>
  )
}

type DeleteCourtDialogProps = {
  court: Court
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function DeleteCourtDialog({
  court,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteCourtDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-court-title"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onCancel()
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="grid size-12 place-items-center rounded-full bg-red-100 text-red-600">
          <Trash2 aria-hidden="true" className="size-6" />
        </div>
        <h2 id="delete-court-title" className="mt-4 text-xl font-bold text-slate-950">
          Xóa sân {court.name}?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Đây là xóa mềm. Sân sẽ biến mất khỏi danh sách và hiện chưa có chức năng khôi phục.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa sân'}
          </button>
        </div>
      </div>
    </div>
  )
}

type FilterSelectProps = {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="space-y-1.5 text-sm font-semibold text-[#374151]">
      <span className="block">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 font-normal outline-none focus:border-[#10B981] focus:ring-4 focus:ring-emerald-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

type StatePanelProps = {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

function StatePanel({ title, description, actionLabel, onAction }: StatePanelProps) {
  return (
    <div className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white px-6 py-16 text-center shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      {description && (
        <p className="mx-auto mt-2 max-w-lg text-sm text-[#6B7280]">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-xl bg-[#10B981] px-4 py-2 text-sm font-bold text-white hover:bg-[#059669]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
