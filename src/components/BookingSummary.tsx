import { Calendar, Clock, MapPin, User } from 'lucide-react';
import type { CreateBookingsResponse, PaymentResponse } from '@/types/booking';

type BookingSummaryData = CreateBookingsResponse | PaymentResponse;

interface BookingSummaryProps {
  data: BookingSummaryData;
  guestPhone?: string | null;
  paymentCode?: string;
}

export function BookingSummary({ data, guestPhone, paymentCode }: BookingSummaryProps) {
  const bookings = data.bookings;
  const totalAmount = 'totalAmount' in data ? data.totalAmount : data.amount;
  const displayCode = paymentCode || `BOOK-${bookings.map((booking) => booking.id).join('-')}`;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm sticky top-4 max-h-[calc(100vh-180px)] overflow-y-auto">
      <h3 className="text-lg font-semibold text-foreground mb-3">
        Chi tiết đặt sân
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="text-xs text-muted-foreground mb-1">Mã thanh toán</div>
          <div className="text-sm font-bold text-foreground break-words">
            {displayCode}
          </div>
        </div>

        <div className="pb-3 border-b border-border">
          <div>
            <div className="text-sm font-bold text-foreground">
              {data.branchName}
            </div>
            <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{data.branchAddress}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pb-3 border-b border-border">
          {bookings.map((booking) => {
            const sortedSlots = [...booking.slots].sort((a, b) =>
              a.slotStart.localeCompare(b.slotStart),
            );
            const firstSlot = sortedSlots[0];
            const lastSlot = sortedSlots[sortedSlots.length - 1];
            return (
              <div key={booking.id} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-foreground">
                    {booking.courtName}
                    </div>
                    <div className="text-xs text-muted-foreground">Booking #{booking.id}</div>
                  </div>
                  <span className="text-sm font-bold text-foreground whitespace-nowrap">
                    {formatCurrency(booking.totalPrice)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formatDate(booking.date)}</span>
                  <span className="text-border">•</span>
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {firstSlot && lastSlot
                      ? `${formatTime(firstSlot.slotStart)} - ${formatTime(lastSlot.slotEnd)}`
                      : 'Chưa có slot'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{booking.slots.length} khung giờ</span>
                  <span>{formatCurrency(booking.totalPrice)}/booking</span>
                </div>
              </div>
            );
          })}
        </div>

        {guestPhone ? (
          <div className="pb-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">
                Thông tin khách hàng
              </span>
            </div>
            <div className="flex justify-between ml-7">
              <span className="text-xs text-muted-foreground">Số điện thoại</span>
              <span className="text-xs font-medium text-foreground">{guestPhone}</span>
            </div>
          </div>
        ) : null}

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm font-semibold text-foreground">
              Tổng thanh toán
            </span>
            <span className="text-2xl font-bold text-primary whitespace-nowrap">
              {formatCurrency(totalAmount)}
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
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function formatTime(value: string) {
  return value.slice(0, 5);
}
