import {
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Building2,
} from 'lucide-react';
import type { AdminBooking } from '@/types/admin-booking';
import { StatusBadge } from './StatusBadge';
import { ZoomableImage } from '@/components/ui/image-viewer';

interface BookingDetailModalProps {
  booking: AdminBooking;
  /** True when the booking has a submitted receipt waiting in the branch's pending payments. */
  hasPendingPayment: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: (actionType: 'reject_payment' | 'cancel_booking') => void;
}

const PAYMENT_LABELS: Record<string, string> = {
  PENDING: 'Chờ duyệt bill',
  CONFIRMED: 'Đã xác nhận',
  PAID: 'Đã thanh toán',
  REJECTED: 'Bill bị từ chối',
  CANCELLED: 'Đã hủy',
};

export function BookingDetailModal({
  booking,
  hasPendingPayment,
  onClose,
  onApprove,
  onReject,
}: BookingDetailModalProps) {
  const status = booking.status;
  // The owner cannot cancel a booking that already started or finished.
  const canCancel = status === 'PENDING_PAYMENT' || status === 'AWAITING_CONFIRMATION' || status === 'CONFIRMED';
  const canReviewPayment = status === 'AWAITING_CONFIRMATION' && hasPendingPayment;

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
                  {booking.bookingCode}
                </code>
                <span className="text-muted-foreground/40">·</span>
                <StatusBadge status={status} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
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
                  <InfoRow icon={<User className="w-4 h-4" />} label="Họ tên" value={booking.customerName || 'Chưa có'} />
                  <InfoRow icon={<Phone className="w-4 h-4" />} label="Điện thoại" value={booking.customerPhone || 'Chưa có'} />
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
                    icon={<Building2 className="w-4 h-4" />}
                    label="Chi nhánh"
                    value={booking.branchName}
                  />
                  <InfoRow
                    icon={<MapPin className="w-4 h-4" />}
                    label="Sân"
                    value={booking.courtName}
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
                    Tổng tiền khách cần thanh toán
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {formatAmount(booking.totalPrice)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground px-1">
                  Trạng thái thanh toán:{' '}
                  {booking.paymentStatus ? (PAYMENT_LABELS[booking.paymentStatus] ?? booking.paymentStatus) : 'Chưa có'}
                </div>
              </section>
            </div>

            <div className="p-8 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Biên lai thanh toán
                </h4>
              </div>

              {booking.receiptImageUrl ? (
                <div className="flex-1 rounded-2xl overflow-hidden border border-border bg-muted/30 flex items-center justify-center relative group min-h-[200px]">
                  <ZoomableImage
                    src={booking.receiptImageUrl}
                    alt="Biên lai thanh toán"
                    buttonClassName="flex h-full w-full cursor-zoom-in items-center justify-center"
                    className="w-full h-full object-contain max-h-[350px] p-2"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-medium transition-opacity text-sm duration-200">
                    Xem ảnh gốc
                  </span>
                </div>
              ) : (
                <div className="flex-1 rounded-2xl border border-dashed border-border bg-muted/30 p-8 flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium text-foreground">Chưa có dữ liệu biên lai</p>
                  <p className="mt-2 text-xs text-muted-foreground max-w-xs">
                    Khách hàng chưa tải ảnh biên lai hoặc giao dịch bằng tiền mặt/POS.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer — actions */}
        <div className="px-8 py-5 border-t border-border bg-card flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {canReviewPayment
              ? 'Kiểm tra biên lai trước khi xác nhận hoặc từ chối.'
              : canCancel
                ? 'Có thể hủy đơn nếu cần. Trạng thái còn lại đi theo luồng thanh toán, check-in và trả sân.'
                : 'Đơn đã qua bước sử dụng, chỉ có thể xem thông tin tại đây.'}
          </p>
          {(canCancel || canReviewPayment) && (
            <div className="flex gap-3 flex-shrink-0">
              {canReviewPayment && (
                <button
                  onClick={() => onReject('reject_payment')}
                  className="flex items-center gap-2 bg-amber-50 text-amber-600 border border-amber-200 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-amber-100 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Từ chối bill
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => onReject('cancel_booking')}
                  className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Hủy đơn
                </button>
              )}
              {canReviewPayment && (
                <button
                  onClick={onApprove}
                  style={{ backgroundColor: '#006d38' }}
                  className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
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
