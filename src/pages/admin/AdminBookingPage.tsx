import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  InboxIcon,
  HandCoins,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { AdminBooking, BookingStatus } from '@/types/admin-booking';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { BookingDetailModal } from '../../components/admin/BookingDetailModal';
import { BranchSelect } from '../../components/admin/BranchSelect';
import { useBranchChoice } from '@/hooks/use-branch-choice';
import { ConfirmModal, type ConfirmAction } from '../../components/admin/ConfirmModal';
import {
  useAdminBookings,
  useApprovePayment,
  useBookingCounts,
  useCancelBooking,
  usePendingPayments,
  usePendingRefunds,
  useRejectPayment,
} from '@/hooks/use-admin-bookings';
import { getApiErrorMessage } from '@/common/utils/api-error';

type TabFilter = 'all' | 'AWAITING_CONFIRMATION' | 'CONFIRMED' | 'CANCELLED';

const PAGE_SIZE = 10;

const TAB_STATUS: Record<TabFilter, BookingStatus | undefined> = {
  all: undefined,
  AWAITING_CONFIRMATION: 'AWAITING_CONFIRMATION',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
};

export function AdminBookingPage() {
  const { branches, branchId, setBranchId } = useBranchChoice();
  const [tab, setTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);

  // Modal state
  const [detailBooking, setDetailBooking] = useState<AdminBooking | null>(null);
  const [confirmState, setConfirmState] = useState<{
    action: ConfirmAction;
    booking: AdminBooking;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const listQuery = useAdminBookings(
    { branchId, status: TAB_STATUS[tab], search: debouncedSearch, page, size: PAGE_SIZE },
    branchId !== undefined,
  );
  const counts = useBookingCounts(branchId);
  const pendingPayments = usePendingPayments(branchId);
  const pendingRefunds = usePendingRefunds(branchId, 0, 100);
  const approveMutation = useApprovePayment();
  const rejectPaymentMutation = useRejectPayment();
  const cancelMutation = useCancelBooking();

  const data = listQuery.data;
  const bookings = data?.content ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const loading = listQuery.isLoading;
  const refundPending = pendingRefunds.data?.length ?? 0;

  // payment of a booking = the pending payment whose bookingId matches
  const paymentOf = (booking: AdminBooking) =>
    pendingPayments.data?.find((payment) => payment.bookingId === booking.id);

  const actionLoading =
    approveMutation.isPending || rejectPaymentMutation.isPending || cancelMutation.isPending;

  const handleRefresh = async () => {
    const [result] = await Promise.all([
      listQuery.refetch(),
      pendingPayments.refetch(),
      pendingRefunds.refetch(),
    ]);
    if (!result.isError) toast.success('Danh sách đã được cập nhật');
  };

  const closeAll = () => {
    setDetailBooking(null);
    setConfirmState(null);
  };

  const handleConfirmAction = async (reason: string) => {
    if (!confirmState) return;
    const { action, booking } = confirmState;
    const payment = paymentOf(booking);

    try {
      if (action === 'approve' || action === 'reject_payment') {
        if (!payment) throw new Error('Booking does not have a submitted payment');
        if (action === 'approve') {
          await approveMutation.mutateAsync(payment.id);
          toast.success('Đã xác nhận thanh toán và booking');
        } else {
          await rejectPaymentMutation.mutateAsync({ paymentId: payment.id, reason });
          toast.success('Đã từ chối bill, booking được mở lại để thanh toán');
        }
      } else {
        await cancelMutation.mutateAsync({ bookingId: booking.id, reason });
        toast.error('Đã hủy đặt sân', {
          description: `Mã đơn: ${booking.bookingCode}`,
          icon: <XCircle className="w-4 h-4 text-red-500" />,
        });
      }
      closeAll();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật booking'), {
        description: `Mã đơn: ${booking.bookingCode}`,
      });
    }
  };

  const tabs: Array<{ key: TabFilter; label: string; count: number }> = [
    { key: 'all', label: 'Tất cả', count: counts.all },
    { key: 'AWAITING_CONFIRMATION', label: 'Chờ duyệt', count: counts.awaiting },
    { key: 'CONFIRMED', label: 'Đã xác nhận', count: counts.confirmed },
    { key: 'CANCELLED', label: 'Đã hủy', count: counts.cancelled },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Duyệt thanh toán & Đặt sân</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi và cập nhật trạng thái đơn đặt sân của khách hàng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BranchSelect
            branches={branches}
            value={branchId}
            onChange={(id) => {
              setBranchId(id);
              setPage(0);
            }}
          />
          <button
            onClick={handleRefresh}
            disabled={listQuery.isFetching}
            style={{ backgroundColor: '#006d38' }}
            className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${listQuery.isFetching ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Tổng đơn"
            value={counts.all}
            icon={<ClipboardList className="w-5 h-5" />}
            color="bg-slate-50 border-slate-200 text-slate-600"
          />
          <StatCard
            label="Chờ duyệt"
            value={counts.awaiting}
            icon={<Clock className="w-5 h-5" />}
            color="bg-amber-50 border-amber-200 text-amber-600"
            urgent={counts.awaiting > 0}
          />
          <StatCard
            label="Đã xác nhận"
            value={counts.confirmed}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="bg-emerald-50 border-emerald-200 text-emerald-600"
          />
          <StatCard
            label="Chờ hoàn tiền"
            value={refundPending}
            icon={<HandCoins className="w-5 h-5" />}
            color="bg-amber-50 border-amber-200 text-amber-600"
            urgent={refundPending > 0}
          />
          <StatCard
            label="Đã hủy"
            value={counts.cancelled}
            icon={<XCircle className="w-5 h-5" />}
            color="bg-red-50 border-red-200 text-red-500"
          />
        </div>

        {refundPending > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-semibold">
              Có {refundPending} yêu cầu hoàn tiền đang chờ admin xử lý.
            </div>
            <Link
              to="/admin/refund-requests"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
            >
              <HandCoins className="h-4 w-4" />
              Xử lý hoàn tiền
            </Link>
          </div>
        )}

        {/* Table card */}
        <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-muted p-1 rounded-xl">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setTab(t.key);
                    setPage(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    tab === t.key
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                  {t.count > 0 && (
                    <span
                      className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                        tab === t.key
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted-foreground/20 text-muted-foreground'
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã đơn, khách hàng..."
                className="w-full pl-9 pr-4 py-2 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <SkeletonRows />
            ) : listQuery.isError ? (
              <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {getApiErrorMessage(listQuery.error, 'Không thể tải danh sách booking')}
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState search={debouncedSearch} tab={tab} />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Mã đơn', 'Khách hàng', 'Sân', 'Lịch đặt', 'Số tiền', 'Trạng thái', 'Thanh toán', 'Thao tác'].map(
                      (col) => (
                        <th
                          key={col}
                          className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      canReview={booking.status === 'AWAITING_CONFIRMATION' && Boolean(paymentOf(booking))}
                      onView={() => setDetailBooking(booking)}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && (data?.totalElements ?? 0) > 0 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Hiển thị{' '}
                <span className="font-medium text-foreground">
                  {page * PAGE_SIZE + 1}–{page * PAGE_SIZE + bookings.length}
                </span>{' '}
                / {data?.totalElements} đơn
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  aria-label="Trang trước"
                  className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <span className="px-2 text-xs font-medium text-muted-foreground">
                  {page + 1}/{totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page + 1 >= totalPages}
                  aria-label="Trang sau"
                  className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          hasPendingPayment={Boolean(paymentOf(detailBooking))}
          onClose={() => setDetailBooking(null)}
          onApprove={() => setConfirmState({ action: 'approve', booking: detailBooking })}
          onReject={(actionType) =>
            setConfirmState({
              action: actionType === 'reject_payment' ? 'reject_payment' : 'reject',
              booking: detailBooking,
            })
          }
        />
      )}

      {confirmState && (
        <ConfirmModal
          open
          action={confirmState.action}
          bookingCode={confirmState.booking.bookingCode}
          loading={actionLoading}
          onConfirm={handleConfirmAction}
          onCancel={() => !actionLoading && setConfirmState(null)}
        />
      )}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
  urgent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  urgent?: boolean;
}) {
  return (
    <div className={`bg-card border rounded-2xl p-5 ${urgent ? 'border-amber-300' : 'border-border'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {urgent && (
          <span className="text-xs text-amber-600 font-medium mb-0.5 animate-pulse">
            cần xử lý
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Booking Row ─────────────────────────────────────────────────────────────

const PAYMENT_LABELS: Record<string, string> = {
  PENDING: 'Chờ duyệt bill',
  CONFIRMED: 'Đã xác nhận',
  PAID: 'Đã thanh toán',
  REJECTED: 'Bill bị từ chối',
  CANCELLED: 'Đã hủy',
};

function BookingRow({
  booking,
  canReview,
  onView,
}: {
  booking: AdminBooking;
  canReview: boolean;
  onView: () => void;
}) {
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-5 py-4">
        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
          {booking.bookingCode}
        </code>
      </td>

      <td className="px-5 py-4">
        <div className="text-sm font-medium">
          {booking.customerName || 'Khách vãng lai'}
        </div>
        <div className="text-xs text-muted-foreground">
          {booking.customerPhone}
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="text-sm font-medium">
          {booking.courtName}
        </div>
        <div className="text-xs text-muted-foreground">
          {booking.branchName}
        </div>
      </td>

      <td className="px-5 py-4">
        <div>{booking.date}</div>
        <div className="text-xs text-muted-foreground">
          {formatDateTime(booking.createdAt)}
        </div>
      </td>

      <td className="px-5 py-4">
        {formatAmount(booking.totalPrice)}
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={booking.status} />
      </td>

      <td className="px-5 py-4">
        <span className="text-xs text-muted-foreground">
          {booking.paymentStatus ? (PAYMENT_LABELS[booking.paymentStatus] ?? booking.paymentStatus) : '-'}
        </span>
      </td>

      <td className="px-5 py-4">
        <button
          onClick={onView}
          style={canReview ? { backgroundColor: '#006d38' } : undefined}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            canReview
              ? 'text-white shadow-sm hover:opacity-90 active:scale-95'
              : 'border border-border text-foreground hover:bg-muted'
          }`}
          aria-label={`${canReview ? 'Xử lý' : 'Xem'} ${booking.bookingCode}`}
        >
          {canReview ? 'Xử lý' : 'Xem'}
        </button>
      </td>
    </tr>
  );
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('vi-VN');
};

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ search, tab }: { search: string; tab: TabFilter }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-8">
      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
        <InboxIcon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-foreground mb-1">Không có đơn nào</h3>
      {search ? (
        <p className="text-sm text-muted-foreground">
          Không tìm thấy kết quả cho "{search}". Thử từ khóa khác.
        </p>
      ) : tab === 'AWAITING_CONFIRMATION' ? (
        <p className="text-sm text-muted-foreground">
          Tất cả biên lai đã được xử lý. Không còn đơn nào chờ duyệt.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Chưa có đơn đặt sân nào trong danh mục này.
        </p>
      )}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="p-6 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center animate-pulse">
          <div className="h-8 w-28 bg-muted rounded-lg" />
          <div className="h-8 flex-1 bg-muted rounded-lg" />
          <div className="h-8 flex-1 bg-muted rounded-lg" />
          <div className="h-8 w-24 bg-muted rounded-lg" />
          <div className="h-8 w-20 bg-muted rounded-lg" />
          <div className="h-8 w-20 bg-muted rounded-lg" />
          <div className="h-14 w-14 bg-muted rounded-xl" />
          <div className="h-8 w-20 bg-muted rounded-lg" />
        </div>
      ))}
    </div>
  );
}
