import { Calendar, Clock, MapPin, Ticket, Tag, X, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { CreateBookingsResponse, PaymentResponse } from '@/types/booking';
import { getVoucherByCode } from '@/services/voucher/voucher.api';
import type { Voucher } from '@/types/voucher';

type BookingSummaryData = CreateBookingsResponse | PaymentResponse;

interface BookingSummaryProps {
  data: BookingSummaryData;
  guestPhone?: string | null;
  paymentCode?: string;
  onVoucherChange?: (voucher: Voucher | null, discountAmount: number) => void;
}

export function BookingSummary({ data, paymentCode, onVoucherChange }: BookingSummaryProps) {
  const bookings = data.bookings;
  const originalTotalAmount = 'totalAmount' in data ? data.totalAmount : data.amount;
  const displayCode = paymentCode || `BOOK-${bookings.map((booking) => booking.id).join('-')}`;

  // Voucher states
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApplyVoucher = async () => {
    const code = voucherInput.trim();
    if (!code) return;

    setErrorMsg(null);
    setIsValidating(true);

    try {
      const voucher = await getVoucherByCode(code);

      if (!voucher.active) {
        setErrorMsg('Mã giảm giá này hiện đang ngưng hoạt động.');
        setIsValidating(false);
        return;
      }

      const now = new Date();
      const startDate = new Date(voucher.startDate);
      const expiryDate = new Date(voucher.expiryDate);
      if (now < startDate || now > expiryDate) {
        setErrorMsg('Mã giảm giá đã hết hạn hoặc chưa đến thời gian sử dụng.');
        setIsValidating(false);
        return;
      }

      if (voucher.usageCount >= voucher.usageLimit) {
        setErrorMsg('Mã giảm giá đã hết lượt sử dụng.');
        setIsValidating(false);
        return;
      }

      if (voucher.branchId && data.branchId && voucher.branchId !== data.branchId) {
        setErrorMsg('Mã giảm giá này không áp dụng cho cơ sở hiện tại.');
        setIsValidating(false);
        return;
      }

      if (voucher.minOrderValue && originalTotalAmount < voucher.minOrderValue) {
        setErrorMsg(`Đơn hàng chưa đạt giá trị tối thiểu ${formatCurrency(voucher.minOrderValue)}.`);
        setIsValidating(false);
        return;
      }

      // Calculate discount
      let calculatedDiscount = 0;
      if (voucher.discountType === 'PERCENTAGE') {
        calculatedDiscount = (originalTotalAmount * voucher.discountValue) / 100;
        if (voucher.maxDiscountValue && calculatedDiscount > voucher.maxDiscountValue) {
          calculatedDiscount = voucher.maxDiscountValue;
        }
      } else {
        calculatedDiscount = voucher.discountValue;
      }

      calculatedDiscount = Math.min(calculatedDiscount, originalTotalAmount);

      setAppliedVoucher(voucher);
      setDiscountAmount(calculatedDiscount);
      setVoucherInput('');
      if (onVoucherChange) {
        onVoucherChange(voucher, calculatedDiscount);
      }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const serverMsg = errorResponse?.response?.data?.message || errorResponse?.message;
      setErrorMsg(serverMsg || 'Mã giảm giá không hợp lệ hoặc không tồn tại.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setErrorMsg(null);
    if (onVoucherChange) {
      onVoucherChange(null, 0);
    }
  };

  const finalAmount = Math.max(0, originalTotalAmount - discountAmount);

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
              {data.branchName}
            </div>
            <div className="mt-1 flex items-start gap-1.5 text-xs text-[#667267]">
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
                    <div className="text-sm font-bold text-[#191c1d]">
                    {booking.courtName}
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-sm font-bold text-[#191c1d]">
                    {formatCurrency(booking.totalPrice)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#667267]">
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
              </div>
            );
          })}
        </div>

        {/* Voucher Input Section */}
        <div className="pb-3 border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-primary" />
              Mã giảm giá (Voucher)
            </span>
          </div>

          {!appliedVoucher ? (
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherInput}
                  onChange={(e) => {
                    setVoucherInput(e.target.value);
                    setErrorMsg(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyVoucher();
                    }
                  }}
                  placeholder="Nhập mã giảm giá..."
                  className="w-full h-9 px-3 text-xs border border-border rounded-xl bg-background font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
                <button
                  type="button"
                  disabled={!voucherInput.trim() || isValidating}
                  onClick={handleApplyVoucher}
                  className="h-9 px-3.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isValidating ? 'Đang check...' : 'Áp dụng'}
                </button>
              </div>
              {errorMsg && (
                <p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errorMsg}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-2.5 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{appliedVoucher.code}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="text-xs text-muted-foreground hover:text-destructive p-1 transition"
                  title="Hủy mã giảm giá"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                {appliedVoucher.discountType === 'PERCENTAGE'
                  ? `Giảm ${appliedVoucher.discountValue}% ${
                      appliedVoucher.maxDiscountValue
                        ? `(tối đa ${formatCurrency(appliedVoucher.maxDiscountValue)})`
                        : ''
                    }`
                  : `Giảm ${formatCurrency(appliedVoucher.discountValue)}`}
              </p>
            </div>
          )}
        </div>

        {/* Calculation breakdown */}
        <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
          <div className="flex justify-between">
            <span>Tiền sân:</span>
            <span className="font-semibold text-foreground">{formatCurrency(originalTotalAmount)}</span>
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
