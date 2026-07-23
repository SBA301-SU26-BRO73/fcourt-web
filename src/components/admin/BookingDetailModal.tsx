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
  HandCoins,
} from 'lucide-react';
import type { Booking, BookingStatus } from '@/services/admin/booking.service';
import { StatusBadge } from './StatusBadge';

interface BookingDetailModalProps {
  booking: Booking;
  onClose: () => void;
  onApprove: () => void;
  onReject: (actionType: 'reject_payment' | 'cancel_booking') => void;
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
                  {booking.slots && booking.slots.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-muted-foreground">Khung giờ đặt</div>
                        <div className="mt-1.5 overflow-hidden rounded-xl border border-border">
                          {booking.slots.map((slot) => {
                            const start = slot.slotStart.slice(0, 5);
                            const end = slot.slotEnd.slice(0, 5);
                            return (
                              <div
                                key={`${slot.courtId}-${slot.bookingDate}-${slot.slotStart}`}
                                className="flex items-center justify-between gap-3 border-b border-border px-3 py-2 last:border-b-0"
                              >
                                <span className="font-mono text-xs font-medium text-foreground">
                                  {start} - {end}
                                </span>
                                <span className="text-xs font-semibold text-foreground">
                                  {formatAmount(slot.priceAtBooking)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
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
                  Cập nhật lần cuối {formatDateTime(booking.updatedAt)}
                </div>
              </section>

              {booking.refundStatus && (
                <>
                  <div className="border-t border-border" />

                  <section>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Yêu cầu hủy & hoàn tiền
                    </h4>
                    <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 font-bold">
                          <HandCoins className="h-4 w-4" />
                          {booking.refundStatus === 'PENDING'
                            ? 'Đang chờ admin hoàn tiền'
                            : 'Đã xác nhận hoàn tiền'}
                        </span>
                        {booking.refundAmount != null && (
                          <span className="font-bold">{formatAmount(booking.refundAmount)}</span>
                        )}
                      </div>
                      <InfoRow icon={<XCircle className="w-4 h-4" />} label="Lý do khách gửi" value={booking.refundReason || 'Chưa có'} />
                      <InfoRow icon={<HandCoins className="w-4 h-4" />} label="Ngân hàng nhận hoàn" value={booking.refundBankName || 'Chưa có'} />
                      <InfoRow icon={<HandCoins className="w-4 h-4" />} label="Số tài khoản" value={booking.refundBankAccountNumber || 'Chưa có'} />
                      <InfoRow icon={<User className="w-4 h-4" />} label="Tên chủ tài khoản" value={booking.refundBankAccountName || 'Chưa có'} />
                      {booking.refundProofImageUrl && (
                        <a
                          href={booking.refundProofImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block overflow-hidden rounded-xl border border-amber-200 bg-white"
                        >
                          <img
                            src={booking.refundProofImageUrl}
                            alt="Chứng từ hoàn tiền"
                            className="max-h-72 w-full object-contain"
                          />
                        </a>
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>

            <div className="p-8 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Biên lai thanh toán
                </h4>
              </div>

              {booking.billImageUrl ? (
                <div className="flex-1 rounded-2xl overflow-hidden border border-border bg-muted/30 flex items-center justify-center relative group min-h-[200px]">
                  <img
                    src={booking.billImageUrl}
                    alt="Biên lai thanh toán"
                    className="w-full h-full object-contain max-h-[350px] p-2"
                  />
                  <a
                    href={booking.billImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-medium transition-opacity text-sm duration-200"
                  >
                    Xem ảnh gốc
                  </a>
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
            {canReview
              ? 'Kiểm tra thông tin đặt sân trước khi xác nhận hoặc hủy.'
              : canEditDecision
                ? 'Có thể điều chỉnh kết quả xác nhận nếu cần.'
                : 'Đơn đã qua bước sử dụng, chỉ có thể xem thông tin tại đây.'}
          </p>
          {canEditDecision && (
            <div className="flex gap-3 flex-shrink-0">
              {status === 'AWAITING_CONFIRMATION' && (
                <button
                  onClick={() => onReject('reject_payment')}
                  className="flex items-center gap-2 bg-amber-50 text-amber-600 border border-amber-200 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-amber-100 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Từ chối bill
                </button>
              )}
              {status !== 'CANCELLED' && (
                <button
                  onClick={() => onReject('cancel_booking')}
                  className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Hủy đơn
                </button>
              )}
              {status === 'AWAITING_CONFIRMATION' && (
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
