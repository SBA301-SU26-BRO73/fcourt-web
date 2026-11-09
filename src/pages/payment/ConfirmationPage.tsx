import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ArrowLeft,
  Shield,
  ImageOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ProgressStepper } from '../../components/ProgressStepper';
import { BookingSummary } from '../../components/BookingSummary';
import { CheckinQrCard } from '@/components/booking/CheckinQrCard';
import { PaymentLoading, PaymentMessage } from './payment-state-card';
import {
  CHECKOUT_FAILURE_MESSAGE,
  classifyCheckoutError,
  parsePositiveInt,
  POLL_DEADLINE_MS,
  resolveConfirmationView,
  type ConfirmationView,
} from './payment.utils';
import { useBookingDetail, usePaymentStatus } from '@/hooks/use-customer-checkout';
import { clearActiveHold } from '@/utils/hold-storage';

interface LocationState {
  file?: { name: string; size: number; previewUrl: string };
  free?: boolean;
}

export function ConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = parsePositiveInt(searchParams.get('bookingId'));

  if (bookingId === null) {
    return (
      <PaymentMessage
        title="Không tìm thấy thông tin thanh toán"
        message="Vui lòng chọn slot và gửi biên lai lại."
        actions={[{ label: 'Chọn sân', onClick: () => navigate('/slot-booking') }]}
      />
    );
  }
  return <ConfirmationView key={bookingId} bookingId={bookingId} />;
}

function ConfirmationView({ bookingId }: { bookingId: number }) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};
  const [startedAt] = useState(() => Date.now());

  const payment = usePaymentStatus(bookingId, { startedAt });
  const bookingQuery = useBookingDetail(bookingId, {
    // The booking is updated from the payment event: keep reading until the ticket code exists.
    refetchWhile: (booking) =>
      payment.data?.paymentStatus === 'SUCCESS' && !booking.checkInCode && booking.status !== 'CANCELLED',
  });
  const booking = bookingQuery.data;

  const deadlineReached = Date.now() - startedAt >= POLL_DEADLINE_MS && payment.data?.paymentStatus !== 'SUCCESS';
  const view = resolveConfirmationView({
    paymentState: payment.data?.paymentStatus ?? null,
    rejectReason: payment.data?.rejectReason ?? null,
    paymentError: payment.error,
    bookingStatus: booking?.status ?? null,
    checkInCode: booking?.checkInCode ?? null,
    deadlineReached,
  });

  if (!booking && bookingQuery.isError) {
    const failure = classifyCheckoutError(bookingQuery.error);
    return (
      <PaymentMessage
        title="Không tìm thấy thông tin thanh toán"
        message={CHECKOUT_FAILURE_MESSAGE[failure]}
        actions={[
          { label: 'Thử lại', onClick: () => void bookingQuery.refetch(), primary: false },
          { label: 'Chọn sân', onClick: () => navigate('/slot-booking') },
        ]}
      />
    );
  }

  if (!booking) return <PaymentLoading label="Đang tải trạng thái thanh toán..." />;

  const previewUrl = state.file?.previewUrl ?? booking.receiptImageUrl ?? undefined;
  const fileName = state.file?.name ?? 'Biên lai thanh toán';
  const isFree = (state.free ?? false) || booking.totalPrice === 0;

  const goNewBooking = () => {
    clearActiveHold();
    navigate('/slot-booking');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/my-bookings')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Đơn của tôi</span>
            </button>

            <div className="absolute left-1/2 -translate-x-1/2">
              <h1 className="text-xl font-bold text-primary">SportCourt</h1>
            </div>

            <div className="flex items-center gap-2 bg-accent/50 px-3 py-1.5 rounded-lg">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">SSL Secure</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Xác nhận thanh toán
          </h1>
          <p className="text-muted-foreground">
            {view.kind === 'approved' ? 'Đặt sân của bạn đã được xác nhận' : 'Chúng tôi đang xem xét biên lai của bạn'}
          </p>
        </div>

        <ProgressStepper currentStep={3} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — status panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Receipt preview */}
            {!isFree && (
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Biên lai đã tải lên
                </h2>

                <div className="flex gap-6 items-start">
                  <div className="w-48 h-48 rounded-2xl overflow-hidden border border-border bg-muted/30 flex-shrink-0 flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Biên lai"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImageOff className="w-10 h-10" />
                        <span className="text-xs">Không có ảnh</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 pt-2 space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Tên file</div>
                      <div className="text-sm font-semibold text-foreground truncate">{fileName}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Mã đặt sân</div>
                      <div className="text-sm font-semibold text-foreground">{booking.bookingCode}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Cập nhật lần cuối</div>
                      <div className="text-sm font-semibold text-foreground">
                        {payment.data?.updatedAt ? formatDateTime(payment.data.updatedAt) : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status card */}
            <StatusCard
              view={view}
              isChecking={payment.isFetching}
              onCheckAgain={() => void payment.refetch()}
              onNewBooking={goNewBooking}
              onMyBookings={() => navigate('/my-bookings')}
            />

            {view.kind === 'approved' && (
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <h4 className="mb-4 text-sm font-semibold text-foreground">Mã check-in</h4>
                {booking.checkInCode ? (
                  <>
                    <CheckinQrCard checkinCode={booking.checkInCode} bookingCode={booking.bookingCode} />
                    <p className="mt-3 break-all text-center font-mono text-xs text-muted-foreground">{booking.checkInCode}</p>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang đồng bộ mã check-in, vui lòng đợi vài giây...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — booking summary */}
          <div className="lg:col-span-1">
            <BookingSummary booking={booking} paymentCode={booking.bookingCode} />
          </div>
        </div>
      </main>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ─── Status Card ────────────────────────────────────────────────────────────

interface StatusCardProps {
  view: ConfirmationView;
  isChecking: boolean;
  onCheckAgain: () => void;
  onNewBooking: () => void;
  onMyBookings: () => void;
}

export function StatusCard({ view, isChecking, onCheckAgain, onNewBooking, onMyBookings }: StatusCardProps) {
  const configs: Record<
    ConfirmationView['kind'],
    {
      icon: React.ReactNode;
      bg: string;
      border: string;
      title: string;
      description: React.ReactNode;
      actions?: React.ReactNode;
    }
  > = {
    pending: {
      icon: <Clock className="w-10 h-10 text-amber-500" />,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      title: view.kind === 'pending' && view.stalled ? 'Vẫn đang chờ xác nhận' : 'Đang chờ xác nhận',
      description: (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Biên lai của bạn đang được đội ngũ xem xét. Thường mất từ 5–15 phút trong giờ
            cao điểm. Bạn có thể đóng trang này, đơn vẫn được giữ trong mục Đơn của tôi.
          </p>
          {view.kind === 'pending' && view.stalled ? (
            <button
              type="button"
              disabled={isChecking}
              onClick={onCheckAgain}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/80 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              Kiểm tra lại
            </button>
          ) : (
            <div className="flex items-center gap-2 mt-3">
              <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
              <span className="text-xs text-amber-600 font-medium">Đang kiểm tra trạng thái...</span>
            </div>
          )}
        </div>
      ),
    },
    approved: {
      icon: <CheckCircle2 className="w-10 h-10 text-primary" />,
      bg: 'bg-primary/5',
      border: 'border-primary/30',
      title: 'Thanh toán được xác nhận!',
      description: (
        <p className="text-sm text-muted-foreground">
          Tuyệt vời! Đặt sân của bạn đã được xác nhận thành công. Hãy đưa mã QR bên dưới cho nhân viên khi đến sân.
        </p>
      ),
      actions: (
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={onNewBooking}
            className="flex-1 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Đặt sân mới
          </button>
          <button
            onClick={onMyBookings}
            className="flex-1 bg-muted text-foreground py-3 px-6 rounded-xl font-semibold text-sm hover:bg-muted/80 transition-colors"
          >
            Xem đơn của tôi
          </button>
        </div>
      ),
    },
    rejected: {
      icon: <XCircle className="w-10 h-10 text-destructive" />,
      bg: 'bg-destructive/5',
      border: 'border-destructive/20',
      title: 'Thanh toán bị từ chối',
      description: (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Biên lai không hợp lệ hoặc không đúng số tiền/nội dung chuyển khoản. Đơn này đã bị hủy
            và khung giờ được mở lại, vui lòng đặt lại.
          </p>
          {view.kind === 'rejected' && view.reason && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mt-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-xs text-destructive">Lý do: {view.reason}</div>
              </div>
            </div>
          )}
        </div>
      ),
      actions: (
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={onNewBooking}
            className="flex-1 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Đặt lại
          </button>
          <button
            onClick={onMyBookings}
            className="flex-1 bg-muted text-foreground py-3 px-6 rounded-xl font-semibold text-sm hover:bg-muted/80 transition-colors"
          >
            Xem đơn của tôi
          </button>
        </div>
      ),
    },
    cancelled: {
      icon: <XCircle className="w-10 h-10 text-destructive" />,
      bg: 'bg-destructive/5',
      border: 'border-destructive/20',
      title: 'Đơn đã bị hủy',
      description: (
        <p className="text-sm text-muted-foreground">
          Đơn đặt sân đã hết hạn hoặc bị hủy nên khung giờ đã được mở lại. Vui lòng chọn lại khung giờ.
        </p>
      ),
      actions: (
        <button
          onClick={onNewBooking}
          className="mt-6 w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Đặt sân mới
        </button>
      ),
    },
    error: {
      icon: <AlertCircle className="w-10 h-10 text-destructive" />,
      bg: 'bg-destructive/5',
      border: 'border-destructive/20',
      title: 'Lỗi kết nối',
      description: (
        <p className="text-sm text-muted-foreground">
          {view.kind === 'error' ? CHECKOUT_FAILURE_MESSAGE[view.failure] : 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'}
        </p>
      ),
      actions: (
        <button
          onClick={onCheckAgain}
          className="mt-6 w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Thử lại
        </button>
      ),
    },
  };

  const cfg = configs[view.kind];

  return (
    <div className={`${cfg.bg} border ${cfg.border} rounded-3xl p-8 shadow-sm`}>
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0 mt-1">{cfg.icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-3">{cfg.title}</h3>
          {cfg.description}
          {cfg.actions}
        </div>
      </div>
    </div>
  );
}
