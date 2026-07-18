import {
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { Booking, BookingStatus } from '@/services/admin/booking.service';
import { StatusBadge } from './StatusBadge';

interface BookingDetailModalProps {
  booking: Booking;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function BookingDetailModal({
  booking,
  onClose,
  onApprove,
  onReject,
}: BookingDetailModalProps) {
  const status = getBookingStatus(booking);
  const canReview = isReviewableStatus(status);
  const canEditDecision = canReview || status === 'CONFIRMED' || status === 'CANCELLED';
  const bookingCode = `BK-${booking.id}`;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-background rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-foreground">Chi tiết đặt sân</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <code className="text-xs font-mono text-muted-foreground">
                  {bookingCode}
                </code>
                <span className="text-muted-foreground/40">·</span>
                <StatusBadge status={status} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* Left — booking info */}
            <div className="p-8 space-y-6">
              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Khách hàng
                </h4>
                <div className="space-y-2.5">
                  <InfoRow icon={<User className="w-4 h-4" />} label="Mã khách hàng" value={`#${booking.customerId}`} />
                  <InfoRow icon={<Phone className="w-4 h-4" />} label="Điện thoại" value={booking.guestPhone || 'Chưa có'} />
                  <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={booking.customerEmail} />
                </div>
              </section>

              <div className="border-t border-border" />

              {/* Court */}
              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Thông tin sân
                </h4>
                <div className="space-y-2.5">
                  <InfoRow
                    icon={<MapPin className="w-4 h-4" />}
                    label="Sân"
                    value={booking.courtName}
                  />
                  <InfoRow
                    icon={<MapPin className="w-4 h-4" />}
                    label="Mã sân"
                    value={`#${booking.courtId}`}
                  />
                  <InfoRow
                    icon={<Calendar className="w-4 h-4" />}
                    label="Ngày"
                    value={booking.date}
                  />
                  <InfoRow
                    icon={<Clock className="w-4 h-4" />}
                    label="Ngày tạo"
                    value={formatDateTime(booking.createdAt)}
                  />
                </div>
              </section>

              <div className="border-t border-border" />

              {/* Payment */}
              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Thanh toán
                </h4>
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">
                    Tổng thanh toán
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {formatAmount(booking.totalPrice)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground px-1">
                  Cập nhật lần cuối {formatDateTime(booking.updatedAt)}
                </div>
              </section>
            </div>

            <div className="p-8 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Biên lai thanh toán
                </h4>
              </div>

              <div className="flex-1 rounded-2xl border border-dashed border-border bg-muted/30 p-8 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-foreground">Chưa có dữ liệu biên lai</p>
                <p className="mt-2 text-xs text-muted-foreground max-w-xs">
                  API booking hiện tại chỉ trả về thông tin đặt sân, khách hàng, trạng thái và tổng tiền.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer — actions */}
        <div className="px-8 py-5 border-t border-border bg-card flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {canReview
              ? 'Kiểm tra thông tin đặt sân trước khi xác nhận hoặc hủy.'
              : canEditDecision
                ? 'Có thể điều chỉnh kết quả xác nhận nếu cần.'
                : 'Đơn đã qua bước sử dụng, chỉ có thể xem thông tin tại đây.'}
          </p>
          {canEditDecision && (
            <div className="flex gap-3 flex-shrink-0">
              {status !== 'CANCELLED' && (
                <button
                  onClick={onReject}
                  className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Hủy đơn
                </button>
              )}
              {status !== 'CONFIRMED' && (
                <button
                  onClick={onApprove}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Xác nhận
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getBookingStatus(booking: Booking): BookingStatus {
  return booking.bookingStatus ?? booking.bookingstatus ?? booking.status ?? 'PENDING_PAYMENT';
}

function isReviewableStatus(status: BookingStatus) {
  return status === 'PENDING_PAYMENT' || status === 'AWAITING_CONFIRMATION';
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground mt-0.5">{value}</div>
      </div>
    </div>
  );
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('vi-VN');
};
