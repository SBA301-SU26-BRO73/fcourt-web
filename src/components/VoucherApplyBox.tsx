import { AlertCircle, Tag, Ticket } from 'lucide-react';
import { useState } from 'react';
import { getApiErrorMessage, toastApiError } from '@/common/utils/api-error';
import { useApplyVoucher, useRemoveVoucher, useValidateVoucher } from '@/hooks/use-customer-checkout';
import type { MyBooking } from '@/types/my-booking';
import type { VoucherValidateReason, VoucherValidation } from '@/types/voucher';

const REASON_MESSAGES: Record<Exclude<VoucherValidateReason, 'VALID'>, string> = {
  ALREADY_APPLIED: 'Mã này đã được áp dụng cho đơn đặt sân.',
  NOT_FOUND: 'Mã giảm giá không tồn tại.',
  WRONG_BRANCH: 'Mã giảm giá không áp dụng cho chi nhánh này.',
  EXPIRED: 'Mã giảm giá đã hết hạn.',
  NOT_STARTED: 'Mã giảm giá chưa đến thời gian sử dụng.',
  USAGE_LIMIT_REACHED: 'Mã giảm giá đã hết lượt sử dụng.',
  MIN_ORDER_NOT_MET: 'Đơn hàng chưa đạt giá trị tối thiểu để dùng mã này.',
  ALREADY_USED: 'Bạn đã sử dụng mã giảm giá này rồi.',
  BOOKING_LOCKED: 'Đơn đặt sân không còn có thể áp dụng mã giảm giá.',
  BOOKING_HAS_VOUCHER: 'Đơn đặt sân đã có mã giảm giá khác.',
}

const formatVnd = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)

interface VoucherApplyBoxProps {
  booking: MyBooking;
  disabled?: boolean;
}

export function VoucherApplyBox({ booking, disabled }: VoucherApplyBoxProps) {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const apply = useApplyVoucher(booking.id);
  const validate = useValidateVoucher(booking.id);
  const remove = useRemoveVoucher(booking.id);
  const [preview, setPreview] = useState<VoucherValidation | null>(null);
  const applied = booking.voucherApplicationId !== null;
  const discount = booking.discountAmount ?? 0;

  const submit = async () => {
    const value = code.trim();
    if (!value || apply.isPending) return;
    setErrorMsg(null);
    try {
      await apply.mutateAsync({ code: value, totalAmount: booking.originalAmount ?? booking.totalPrice });
      setCode('');
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'Mã giảm giá không hợp lệ.'));
    }
  };

  const check = async () => {
    const value = code.trim();
    if (!value || validate.isPending) return;
    setErrorMsg(null);
    setPreview(null);
    try {
      setPreview(await validate.mutateAsync(value));
    } catch (err) {
      toastApiError(err, 'Không kiểm tra được mã giảm giá.');
    }
  };

  const removeCode = async () => {
    if (remove.isPending) return;
    try {
      await remove.mutateAsync();
      setPreview(null);
    } catch (err) {
      toastApiError(err, 'Không gỡ được mã giảm giá.');
    }
  };

  return (
    <div className="pb-3 border-b border-border space-y-2">
      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <Ticket className="w-4 h-4 text-primary" />
        Mã giảm giá (Voucher)
      </span>

      {applied ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase">
            <Tag className="w-3.5 h-3.5" />
            <span>Đã áp dụng mã giảm giá</span>
          </div>
          {discount > 0 && (
            <p className="text-[11px] text-emerald-600">
              Giảm {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(discount)}
            </p>
          )}
          <button
            type="button"
            disabled={remove.isPending || disabled}
            onClick={() => void removeCode()}
            className="mt-1.5 text-[11px] font-bold text-destructive hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {remove.isPending ? 'Đang gỡ...' : 'Gỡ mã'}
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              disabled={disabled}
              onChange={(e) => {
                setCode(e.target.value);
                setErrorMsg(null);
                setPreview(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void submit();
                }
              }}
              placeholder="Nhập mã giảm giá..."
              aria-label="Mã giảm giá"
              className="w-full h-9 px-3 text-xs border border-border rounded-xl bg-background font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              type="button"
              disabled={!code.trim() || validate.isPending || apply.isPending || disabled}
              onClick={() => void check()}
              className="h-9 px-3.5 border border-primary text-primary text-xs font-bold rounded-xl hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {validate.isPending ? 'Đang kiểm tra...' : 'Kiểm tra'}
            </button>
            <button
              type="button"
              disabled={!code.trim() || apply.isPending || disabled}
              onClick={() => void submit()}
              className="h-9 px-3.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {apply.isPending ? 'Đang check...' : 'Áp dụng'}
            </button>
          </div>
          {preview &&
            (preview.valid ? (
              <p role="status" className="text-[11px] text-emerald-700 font-medium mt-1">
                Giảm {formatVnd(preview.discountAmount)}, còn phải trả {formatVnd(preview.finalAmount)}
              </p>
            ) : (
              <p role="alert" className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {preview.reason === 'VALID'
                  ? 'Mã giảm giá không hợp lệ.'
                  : (REASON_MESSAGES[preview.reason] ?? 'Mã giảm giá không hợp lệ.')}
              </p>
            ))}
          {errorMsg && (
            <p role="alert" className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errorMsg}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
