import { Calendar, Clock, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import type { MyBooking } from '@/types/my-booking';

interface BookingSummaryProps {
  booking: MyBooking;
  /** Shown as "Mã thanh toán"; defaults to the booking code. */
  paymentCode?: string;
  /** Amount to pay in whole VND (checkout-info); defaults to booking.totalPrice. */
  payableAmount?: number;
  /** Extra block between the slots and the totals (the voucher box). */
  children?: ReactNode;
}

export function BookingSummary({ booking, paymentCode, payableAmount, children }: BookingSummaryProps) {
  const displayCode = paymentCode || booking.bookingCode;
  const originalAmount = booking.originalAmount ?? booking.totalPrice;
  const discountAmount = booking.discountAmount ?? 0;
  // booking.totalPrice is already the payable amount after a voucher (payment-service charges it).
  const finalAmount = payableAmount ?? booking.totalPrice;
  const sortedSlots = [...booking.slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const firstSlot = sortedSlots[0];
  const lastSlot = sortedSlots[sortedSlots.length - 1];

  return (
    <div className="rounded-2xl border border-[#d8e8dc] bg-white p-5 shadow-[0_6px_20px_rgba(46,125,50,0.05)]">
      <h3 className="mb-4 text-lg font-bold text-[#191c1d]">
        Chi tiết đặt sân
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="text-xs text-[#667267]">Mã thanh toán</div>
          <div className="break-words text-sm font-bold text-[#191c1d]">
            {displayCode}
          </div>
        </div>

        <div className="pb-3 border-b border-border">
          <div>
            <div className="text-sm font-bold text-[#191c1d]">
              {booking.branchName}
            </div>
            {booking.branchAddress && (
              <div className="mt-1 flex items-start gap-1.5 text-xs text-[#667267]">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{booking.branchAddress}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 pb-3 border-b border-border">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-bold text-[#191c1d]">{booking.courtName}</div>
              <span className="whitespace-nowrap text-sm font-bold text-[#191c1d]">
                {formatCurrency(originalAmount)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#667267]">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formatDate(booking.date)}</span>
              <span className="text-border">•</span>
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {firstSlot && lastSlot
                  ? `${formatTime(firstSlot.startTime)} - ${formatTime(lastSlot.endTime)}`
                  : 'Chưa có slot'}
              </span>
            </div>
          </div>
        </div>

        {children}

        {/* Calculation breakdown */}
        <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
          <div className="flex justify-between">
            <span>Tiền sân:</span>
            <span className="font-semibold text-foreground">{formatCurrency(originalAmount)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Giảm giá Voucher:</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
        </div>

        {/* Final Payment Card */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 mt-2">
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm font-bold text-foreground">
              Tổng thanh toán
            </span>
            <span className="text-2xl font-bold text-primary whitespace-nowrap">
              {formatCurrency(finalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function formatTime(value: string) {
  return value.slice(0, 5);
}
