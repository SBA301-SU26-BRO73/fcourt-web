import { AlertCircle, Tag, Ticket } from 'lucide-react';
import { useState } from 'react';
import { getApiErrorMessage } from '@/common/utils/api-error';
import { useApplyVoucher } from '@/hooks/use-customer-checkout';
import type { MyBooking } from '@/types/my-booking';

interface VoucherApplyBoxProps {
  booking: MyBooking;
  disabled?: boolean;
}

export function VoucherApplyBox({ booking, disabled }: VoucherApplyBoxProps) {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const apply = useApplyVoucher(booking.id);
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
              disabled={!code.trim() || apply.isPending || disabled}
              onClick={() => void submit()}
              className="h-9 px-3.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {apply.isPending ? 'Đang check...' : 'Áp dụng'}
            </button>
          </div>
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
