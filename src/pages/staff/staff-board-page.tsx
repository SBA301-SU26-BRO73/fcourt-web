import { useQuery, useQueryClient } from '@tanstack/react-query'
import { LayoutGrid } from 'lucide-react'

import { getCourtBoard } from '@/services/staff/staff.api'
import { useCheckin } from '@/hooks/staff/use-checkin'
import { useCheckout } from '@/hooks/staff/use-checkout'
import type { CourtBoardItem, CourtBoardStatus } from '@/types/staff'

const COURT_BOARD_QUERY_KEY = ['court-board'] as const

const STATUS_STYLES: Record<CourtBoardStatus, { block: string; dot: string; label: string }> = {
  FREE: { block: 'border-green-200 bg-green-50', dot: 'bg-green-500', label: 'Trống' },
  PLAYING: { block: 'border-red-200 bg-red-50', dot: 'bg-red-500', label: 'Đang chơi' },
  ENDING_SOON: { block: 'border-amber-200 bg-amber-50', dot: 'bg-amber-500', label: 'Sắp hết giờ' },
  BOOKED_NOT_CHECKED_IN: { block: 'border-slate-200 bg-slate-100', dot: 'bg-slate-400', label: 'Đã đặt' },
}

function formatClock(time: string | null): string {
  if (!time) return ''
  return time.slice(0, 5)
}

function CourtCard({ court }: { court: CourtBoardItem }) {
  const queryClient = useQueryClient()
  const checkin = useCheckin()
  const checkout = useCheckout()
  const style = STATUS_STYLES[court.status]

  function handleCheckin() {
    if (!court.checkinCode) return
    checkin.mutate(court.checkinCode, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: COURT_BOARD_QUERY_KEY }),
    })
  }

  function handleCheckout() {
    if (!court.bookingId) return
    checkout.mutate(court.bookingId, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: COURT_BOARD_QUERY_KEY }),
    })
  }

  return (
    <div className={`flex flex-col gap-2 rounded-xl border p-4 ${style.block}`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-900">{court.courtName}</span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <span className={`h-2 w-2 rounded-full ${style.dot}`} />
          {style.label}
        </span>
      </div>

      {court.status !== 'FREE' && (
        <div className="text-xs text-slate-500">
          <div>{court.customerName ?? 'Khách vãng lai'}</div>
          <div className="font-mono">
            {formatClock(court.slotStart)} – {formatClock(court.slotEnd)}
            {court.minutesRemaining != null && ` · còn ${court.minutesRemaining} phút`}
          </div>
        </div>
      )}

      <div className="mt-1">
        {court.status === 'BOOKED_NOT_CHECKED_IN' && (
          <button
            type="button"
            disabled={checkin.isPending}
            onClick={handleCheckin}
            className="w-full rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {checkin.isPending ? 'Đang check-in…' : 'Check-in nhanh'}
          </button>
        )}
        {(court.status === 'PLAYING' || court.status === 'ENDING_SOON') && (
          <button
            type="button"
            disabled={checkout.isPending}
            onClick={handleCheckout}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {checkout.isPending ? 'Đang checkout…' : 'Checkout nhanh'}
          </button>
        )}
      </div>
    </div>
  )
}

export function StaffBoardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: COURT_BOARD_QUERY_KEY,
    queryFn: getCourtBoard,
    refetchInterval: 15_000,
  })

  const courts = data ?? []
  const freeCount = courts.filter((c) => c.status === 'FREE').length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Bảng giám sát sân</h1>
          <p className="text-sm text-slate-500">
            {courts.length > 0 ? `${freeCount} / ${courts.length} sân trống` : 'Đang tải…'}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-green-500" /> Trống
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Đang chơi
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" /> Sắp hết giờ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-400" /> Đã đặt
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          Đang tải bảng giám sát…
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700">
          Không thể tải bảng giám sát. Kiểm tra backend.
        </div>
      ) : courts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          <LayoutGrid className="mx-auto mb-2 text-slate-300" size={28} />
          Chi nhánh chưa có sân nào.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {courts.map((court) => (
            <CourtCard key={court.courtId} court={court} />
          ))}
        </div>
      )}
    </div>
  )
}
