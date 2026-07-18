import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  CalendarDays,
  Settings,
  LogOut,
  Bell,
  SlidersHorizontal,
  InboxIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  bookingService,
  type Booking,
  type BookingStatus,
} from '@/services/admin/booking.service';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { BookingDetailModal } from '../../components/admin/BookingDetailModal';
import { ConfirmModal } from '../../components/admin/ConfirmModal';

type TabFilter = 'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';
type ConfirmAction = 'approve' | 'reject';

const PAGE_SIZE = 5;

export function AdminBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    action: ConfirmAction;
    bookingId: number;
    bookingCode: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);

      const data = await bookingService.getAll(0, 100);

      setBookings(sortBookings(data.content));
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách booking');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Filtered & searched bookings
  const filtered = bookings.filter((b) => {
    const status = getBookingStatus(b);
    const matchTab =
      tab === 'all' ||
      (tab === 'PENDING' && isReviewableStatus(status)) ||
      (tab === 'CONFIRMED' && status === 'CONFIRMED') ||
      (tab === 'CANCELLED' && status === 'CANCELLED');
    const q = search.toLowerCase();
    const matchSearch =
        !q ||
        String(b.id).includes(q) ||
        b.customerEmail?.toLowerCase().includes(q) ||
        b.guestPhone?.toLowerCase().includes(q) ||
        b.courtName?.toLowerCase().includes(q);

    return matchTab && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Stat counts
  const stats = {
    pending: bookings.filter((b) => isReviewableStatus(getBookingStatus(b))).length,
    approved: bookings.filter((b) => getBookingStatus(b) === 'CONFIRMED').length,
    rejected: bookings.filter((b) => getBookingStatus(b) === 'CANCELLED').length,
    total: bookings.length,
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    const refreshed = await fetchBookings();

    setRefreshing(false);

    if (refreshed) {
      toast.success('Danh sách đã được cập nhật');
    }
  };

  const openConfirm = (action: ConfirmAction, booking: Booking) => {
    setConfirmState({
      open: true,
      action,
      bookingId: booking.id,
      bookingCode: getBookingCode(booking),
    });
  };

  const handleConfirmAction = useCallback(async () => {
    if (!confirmState) return;
    setActionLoading(true);

    const newStatus: BookingStatus =
      confirmState.action === 'approve' ? 'CONFIRMED' : 'CANCELLED';

    try {
      const updatedBooking = await bookingService.updateStatus(confirmState.bookingId, {
        status: newStatus,
      });
      const fallbackBooking = bookings.find((b) => b.id === confirmState.bookingId);
      const nextBooking = normalizeBookingStatus(
        updatedBooking ?? fallbackBooking,
        confirmState.bookingId,
        newStatus,
      );

      setBookings((prev) =>
        sortBookings(
          prev.map((b) =>
            b.id === confirmState.bookingId ? { ...b, ...nextBooking } : b
          )
        )
      );
      setDetailBooking((prev) =>
        prev?.id === confirmState.bookingId
          ? { ...prev, ...nextBooking }
          : prev
      );

      setConfirmState(null);

      if (newStatus === 'CONFIRMED') {
        toast.success('Đã xác nhận đặt sân thành công', {
          description: `Mã đơn: ${confirmState.bookingCode}`,
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
        });
      } else {
        toast.error('Đã hủy đặt sân', {
          description: `Mã đơn: ${confirmState.bookingCode}`,
          icon: <XCircle className="w-4 h-4 text-red-500" />,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể cập nhật trạng thái booking', {
        description: `Mã đơn: ${confirmState.bookingCode}`,
      });
    } finally {
      setActionLoading(false);
    }
  }, [bookings, confirmState]);

  const tabs: Array<{ key: TabFilter; label: string; count: number }> = [
    { key: 'all', label: 'Tất cả', count: stats.total },
    { key: 'PENDING', label: 'Chờ duyệt', count: stats.pending },
    { key: 'CONFIRMED', label: 'Đã xác nhận', count: stats.approved },
    { key: 'CANCELLED', label: 'Đã hủy', count: stats.rejected },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-border">
          <h1 className="text-xl font-bold text-primary">SportCourt</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Quản trị hệ thống</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Tổng quan', active: false },
            { icon: <ClipboardList className="w-4 h-4" />, label: 'Duyệt đặt sân', active: true },
            { icon: <CalendarDays className="w-4 h-4" />, label: 'Lịch sân', active: false },
            { icon: <Settings className="w-4 h-4" />, label: 'Cài đặt', active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                item.active
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {item.icon}
              {item.label}
              {item.label === 'Duyệt đặt sân' && stats.pending > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">Admin</div>
              <div className="text-xs text-muted-foreground truncate">admin@sportcourt.vn</div>
            </div>
            <LogOut className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-foreground">Duyệt thanh toán đặt sân</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Theo dõi và cập nhật trạng thái đặt sân của khách hàng
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-muted rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {stats.pending > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
              )}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Tổng đơn"
              value={stats.total}
              icon={<ClipboardList className="w-5 h-5" />}
              color="bg-slate-50 border-slate-200 text-slate-600"
            />
            <StatCard
              label="Chờ duyệt"
              value={stats.pending}
              icon={<Clock className="w-5 h-5" />}
              color="bg-amber-50 border-amber-200 text-amber-600"
              urgent={stats.pending > 0}
            />
            <StatCard
              label="Đã xác nhận"
              value={stats.approved}
              icon={<CheckCircle2 className="w-5 h-5" />}
              color="bg-emerald-50 border-emerald-200 text-emerald-600"
            />
            <StatCard
              label="Đã hủy"
              value={stats.rejected}
              icon={<XCircle className="w-5 h-5" />}
              color="bg-red-50 border-red-200 text-red-500"
            />
          </div>

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
                      setPage(1);
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
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm mã đơn, khách hàng..."
                  className="w-full pl-9 pr-4 py-2 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button className="flex items-center gap-2 border border-border px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                  Lọc
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <SkeletonRows />
              ) : pageItems.length === 0 ? (
                <EmptyState search={search} tab={tab} />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {['Mã đơn', 'Khách hàng', 'Sân', 'Lịch đặt', 'Số tiền', 'Trạng thái', 'Cập nhật', 'Thao tác'].map(
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
                    {pageItems.map((booking) => (
                      <BookingRow
                        key={booking.id}
                        booking={booking}
                        onView={() => setDetailBooking(booking)}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Hiển thị{' '}
                  <span className="font-medium text-foreground">
                    {(safePage - 1) * PAGE_SIZE + 1}–
                    {Math.min(safePage * PAGE_SIZE, filtered.length)}
                  </span>{' '}
                  / {filtered.length} đơn
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        p === safePage
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          onClose={() => setDetailBooking(null)}
          onApprove={() => openConfirm('approve', detailBooking)}
          onReject={() => openConfirm('reject', detailBooking)}
        />
      )}

      {confirmState && (
        <ConfirmModal
          open={confirmState.open}
          action={confirmState.action}
          bookingCode={confirmState.bookingCode}
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

function BookingRow({
  booking,
  onView,
}: {
  booking: Booking;
  onView: () => void;
}) {
  const status = getBookingStatus(booking);
  const canReview = isReviewableStatus(status);

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-5 py-4">
        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
          {getBookingCode(booking)}
        </code>
      </td>

      <td className="px-5 py-4">
        <div className="text-sm font-medium">
          {booking.customerEmail}
        </div>
        <div className="text-xs text-muted-foreground">
          {booking.guestPhone}
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="text-sm font-medium">
          {booking.courtName}
        </div>
        <div className="text-xs text-muted-foreground">
          Court ID: {booking.courtId}
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
        <StatusBadge status={status} />
      </td>

      <td className="px-5 py-4">
        <span className="text-xs text-muted-foreground">
          {formatDateTime(booking.updatedAt)}
        </span>
      </td>

      <td className="px-5 py-4">
        <button
          onClick={onView}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
            canReview
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border border-border text-foreground hover:bg-muted'
          }`}
          aria-label={`${canReview ? 'Xử lý' : 'Xem'} ${getBookingCode(booking)}`}
        >
          {canReview ? 'Xử lý' : 'Xem'}
        </button>
      </td>
    </tr>
  );
}

function getBookingStatus(booking: Booking): BookingStatus {
  return booking.bookingStatus ?? booking.bookingstatus ?? booking.status ?? 'PENDING_PAYMENT';
}

function isReviewableStatus(status: BookingStatus) {
  return status === 'PENDING_PAYMENT' || status === 'AWAITING_CONFIRMATION';
}

function normalizeBookingStatus(
  booking: Booking | undefined,
  id: number,
  status: BookingStatus,
): Booking {
  return {
    ...booking,
    id,
    status,
    bookingStatus: status,
    bookingstatus: status,
  } as Booking;
}

function getBookingCode(booking: Booking) {
  return `BK-${booking.id}`;
}

const statusOrder: Record<BookingStatus, number> = {
  PENDING_PAYMENT: 0,
  AWAITING_CONFIRMATION: 1,
  CONFIRMED: 2,
  CHECKED_IN: 3,
  COMPLETED: 4,
  CANCELLED: 5,
};

function sortBookings(items: Booking[]) {
  return [...items].sort((a, b) => {
    const aDay = getDayTime(a.createdAt);
    const bDay = getDayTime(b.createdAt);

    if (aDay !== bDay) return bDay - aDay;

    const statusDiff = statusOrder[getBookingStatus(a)] - statusOrder[getBookingStatus(b)];
    if (statusDiff !== 0) return statusDiff;

    return getDateTime(b.createdAt) - getDateTime(a.createdAt);
  });
}

function getDateTime(value: string) {
  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function getDayTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 0;

  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
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
      ) : tab === 'PENDING' ? (
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
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
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
