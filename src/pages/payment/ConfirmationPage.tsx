import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
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
import type { CreateBookingsResponse, PaymentResponse } from '@/types/booking';
import { getPaymentDetails } from '@/services/booking/booking.api';

type PaymentStatus = 'uploading' | 'pending' | 'approved' | 'rejected' | 'error';

interface LocationState {
  booking?: CreateBookingsResponse;
  payment?: PaymentResponse;
  paymentCode?: string;
  file?: {
    name: string;
    size: number;
    previewUrl: string;
  };
}

// Real polling — queries backend payment status
function useRealPolling(
  paymentId: number | undefined,
  active: boolean,
  onStatusChange: (status: PaymentStatus) => void
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active || !paymentId) return;

    const poll = async () => {
      try {
        const payment = await getPaymentDetails(paymentId);
        if (payment.status === 'CONFIRMED') {
          onStatusChange('approved');
          return;
        } else if (payment.status === 'REJECTED') {
          onStatusChange('rejected');
          return;
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }

      timerRef.current = setTimeout(poll, 3000);
    };

    timerRef.current = setTimeout(poll, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, paymentId, onStatusChange]);
}

export function ConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const paymentIdParam = searchParams.get('paymentId');
  const state = (location.state as LocationState) ?? {};
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(() => state.payment ?? null);
  const [paymentLoading, setPaymentLoading] = useState(!state.payment && !!paymentIdParam);
  const [paymentLoadError, setPaymentLoadError] = useState<string | null>(null);
  const summaryData = paymentData ?? state.booking;
  const paymentCode = state.paymentCode || (
    summaryData ? `BOOK-${summaryData.bookings.map((booking) => booking.id).join('-')}` : 'BOOK'
  );

  const [status, setStatus] = useState<PaymentStatus>(() => {
    if (paymentData?.status === 'CONFIRMED') return 'approved';
    if (paymentData?.status === 'REJECTED') return 'rejected';
    return paymentData ? 'pending' : 'uploading';
  });
  const [pollActive, setPollActive] = useState(() => {
    return !!paymentData && paymentData.status === 'PENDING';
  });
  const [pollCount, setPollCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (paymentData || !paymentIdParam) return;

    const paymentId = Number(paymentIdParam);
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      setPaymentLoadError('Mã thanh toán không hợp lệ.');
      setPaymentLoading(false);
      return;
    }

    getPaymentDetails(paymentId)
      .then((payment) => {
        setPaymentData(payment);
        setPaymentLoadError(null);
      })
      .catch(() => setPaymentLoadError('Không thể tải trạng thái thanh toán.'))
      .finally(() => setPaymentLoading(false));
  }, [paymentData, paymentIdParam]);

  const previewUrl = state.file?.previewUrl;
  const fileName = state.file?.name ?? 'Biên lai thanh toán';

  useEffect(() => {
    if (paymentData) {
      if (paymentData.status === 'PENDING') {
        setStatus('pending');
        setPollActive(true);
      }
      return;
    }
    const uploadTimer = setTimeout(() => {
      setStatus('pending');
      setPollActive(true);
    }, 2000);
    return () => clearTimeout(uploadTimer);
  }, [retryCount, paymentData]);

  // Polling tick counter for UI feedback
  useEffect(() => {
    if (!pollActive) return;
    const interval = setInterval(() => setPollCount((c) => c + 1), 3000);
    return () => clearInterval(interval);
  }, [pollActive]);

  const handleStatusChange = (newStatus: PaymentStatus) => {
    setPollActive(false);
    setStatus(newStatus);
  };

  useRealPolling(paymentData?.id, pollActive, handleStatusChange);

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    setStatus('uploading');
    setPollActive(false);
    setPollCount(0);
  };

  const handleNewBooking = () => navigate('/slot-booking');
  const handleUploadNew = () => navigate('/payment', { state: { booking: state.booking } });

  if (!summaryData && paymentLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Đang tải trạng thái thanh toán...</div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center shadow-sm">
          <h1 className="text-xl font-bold text-foreground mb-2">Không tìm thấy thông tin thanh toán</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {paymentLoadError || 'Vui lòng chọn slot và gửi biên lai lại.'}
          </p>
          <button
            onClick={() => navigate('/slot-booking')}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold"
          >
            Chọn sân
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/payment')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại thanh toán</span>
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
            Chúng tôi đang xem xét biên lai của bạn
          </p>
        </div>

        <ProgressStepper currentStep={3} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — status panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Receipt preview */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Biên lai đã tải lên
              </h2>

              <div className="flex gap-6 items-start">
                {/* Image preview */}
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
                    <div className="text-sm font-semibold text-foreground">{paymentCode}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Thời gian nộp</div>
                    <div className="text-sm font-semibold text-foreground">
                      {new Date().toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      —{' '}
                      {new Date().toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status card */}
            <StatusCard
              status={status}
              pollCount={pollCount}
              onRetry={handleRetry}
              onNewBooking={handleNewBooking}
              onUploadNew={handleUploadNew}
            />

            {/* Polling log */}
            {(status === 'pending' || status === 'approved' || status === 'rejected') && (
              <PollingLog pollCount={pollCount} status={status} />
            )}
          </div>

          {/* Right — booking summary */}
          <div className="lg:col-span-1">
            <BookingSummary
              data={summaryData}
              guestPhone={getGuestPhone(summaryData)}
              paymentCode={paymentCode}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function getGuestPhone(data: CreateBookingsResponse | PaymentResponse) {
  for (const booking of data.bookings) {
    if ('guestPhone' in booking && booking.guestPhone) {
      return booking.guestPhone;
    }
  }
  return null;
}

// ─── Status Card ────────────────────────────────────────────────────────────

interface StatusCardProps {
  status: PaymentStatus;
  pollCount: number;
  onRetry: () => void;
  onNewBooking: () => void;
  onUploadNew: () => void;
}

function StatusCard({ status, pollCount, onRetry, onNewBooking, onUploadNew }: StatusCardProps) {
  const configs: Record<
    PaymentStatus,
    {
      icon: React.ReactNode;
      bg: string;
      border: string;
      title: string;
      description: React.ReactNode;
      actions?: React.ReactNode;
    }
  > = {
    uploading: {
      icon: <Loader2 className="w-10 h-10 text-primary animate-spin" />,
      bg: 'bg-primary/5',
      border: 'border-primary/20',
      title: 'Đang tải biên lai lên...',
      description: (
        <p className="text-sm text-muted-foreground">
          Vui lòng đợi trong giây lát, hệ thống đang xử lý ảnh biên lai của bạn.
        </p>
      ),
    },
    pending: {
      icon: <Clock className="w-10 h-10 text-amber-500" />,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      title: 'Đang chờ xác nhận',
      description: (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Biên lai của bạn đang được đội ngũ xem xét. Thường mất từ 5–15 phút trong giờ
            cao điểm.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
            <span className="text-xs text-amber-600 font-medium">
              Đang kiểm tra trạng thái... (lần {pollCount + 1})
            </span>
          </div>
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
          Tuyệt vời! Đặt sân của bạn đã được xác nhận thành công. Chúng tôi sẽ gửi thông
          báo qua SMS đến số điện thoại đã đăng ký.
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
          <button className="flex-1 bg-muted text-foreground py-3 px-6 rounded-xl font-semibold text-sm hover:bg-muted/80 transition-colors">
            Tải biên nhận
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
            Biên lai không hợp lệ hoặc không đúng số tiền/nội dung chuyển khoản. Vui lòng
            kiểm tra lại và tải lên biên lai mới.
          </p>
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mt-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-xs text-destructive space-y-1">
                <div>• Số tiền không khớp với yêu cầu (350.000 VND)</div>
                <div>• Nội dung chuyển khoản thiếu mã đặt sân SC240529ABCD</div>
                <div>• Ảnh biên lai mờ hoặc không đọc được</div>
              </div>
            </div>
          </div>
        </div>
      ),
      actions: (
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={onUploadNew}
            className="flex-1 bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại biên lai
          </button>
          <button
            onClick={onRetry}
            className="flex-1 bg-muted text-foreground py-3 px-6 rounded-xl font-semibold text-sm hover:bg-muted/80 transition-colors"
          >
            Thử lại
          </button>
        </div>
      ),
    },
    error: {
      icon: <AlertCircle className="w-10 h-10 text-destructive" />,
      bg: 'bg-destructive/5',
      border: 'border-destructive/20',
      title: 'Lỗi kết nối',
      description: (
        <p className="text-sm text-muted-foreground">
          Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.
        </p>
      ),
      actions: (
        <button
          onClick={onRetry}
          className="mt-6 w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Thử lại
        </button>
      ),
    },
  };

  const cfg = configs[status];

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

// ─── Polling Activity Log ────────────────────────────────────────────────────

interface PollingLogProps {
  pollCount: number;
  status: PaymentStatus;
}

function PollingLog({ pollCount, status }: PollingLogProps) {
  const isFinished = status === 'approved' || status === 'rejected';
  const effectiveCount = isFinished ? Math.max(pollCount, 1) : pollCount;

  const entries = Array.from({ length: effectiveCount }, (_, i) => {
    const isLast = i === effectiveCount - 1;
    const isResult = isLast && isFinished;
    return { index: i, isResult };
  });

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h4 className="text-sm font-semibold text-foreground">Nhật ký kiểm tra trạng thái</h4>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        <LogEntry
          time={getOffsetTime(-(entries.length) * 3)}
          message="Biên lai đã được gửi lên máy chủ"
          type="info"
        />
        {entries.map(({ index, isResult }) => (
          <LogEntry
            key={index}
            time={getOffsetTime(-(entries.length - 1 - index) * 3)}
            message={
              isResult
                ? status === 'approved'
                  ? '✓ Thanh toán được xác nhận bởi nhân viên'
                  : '✗ Biên lai bị từ chối — vui lòng kiểm tra lại'
                : `Kiểm tra trạng thái lần ${index + 1}... chưa có phản hồi`
            }
            type={isResult ? (status === 'approved' ? 'success' : 'error') : 'pending'}
          />
        ))}
        {!isFinished && (
          <div className="flex items-center gap-3 py-2">
            <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin flex-shrink-0" />
            <span className="text-xs text-muted-foreground">
              Lần kiểm tra tiếp theo sau vài giây...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function getOffsetTime(secondsOffset: number): string {
  const d = new Date(Date.now() + secondsOffset * 1000);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

interface LogEntryProps {
  time: string;
  message: string;
  type: 'info' | 'pending' | 'success' | 'error';
}

function LogEntry({ time, message, type }: LogEntryProps) {
  const dotColor =
    type === 'success'
      ? 'bg-primary'
      : type === 'error'
      ? 'bg-destructive'
      : type === 'info'
      ? 'bg-blue-400'
      : 'bg-amber-400';

  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0 pt-0.5">
        {time}
      </span>
      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
      <span className="text-xs text-foreground leading-relaxed">{message}</span>
    </div>
  );
}

