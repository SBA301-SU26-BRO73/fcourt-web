import { useState } from 'react';

import { validators } from '@/utils/validators';

export const PHONE_REQUIRED_MESSAGE = 'Vui lòng nhập số điện thoại (10 số, bắt đầu 03, 05, 07, 08 hoặc 09).';
export const PHONE_INVALID_MESSAGE = 'Số điện thoại không hợp lệ. Vui lòng nhập 10 số, bắt đầu 03, 05, 07, 08 hoặc 09.';

export interface SelectedSlot {
  slotId: number;
  courtId: number;
  courtName: string;
  startTime: string; // "HH:MM:SS" or "HH:MM"
  endTime: string;
  price: number;
  date: string;
}

export interface HoldInfo {
  /** mm:ss until the server expiry. */
  countdown: string;
  isWarning: boolean;
  isReleasing?: boolean;
  onRelease: () => void;
  onContinue: () => void;
}

interface BookingPanelProps {
  selectedSlots: SelectedSlot[];
  venueName: string;
  onBook: (phone: string) => void | Promise<void>;
  /** Guests must give a contact phone; a signed-in customer is known by the account, so no field is shown. */
  requiresPhone?: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  /** Set once the slots are held: the panel shows the countdown instead of the phone form. */
  hold?: HoldInfo | null;
}

export default function BookingPanel({ selectedSlots, venueName, onBook, requiresPhone = true, isSubmitting = false, error, hold }: BookingPanelProps) {
  const [guestPhone, setGuestPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const submit = () => {
    if (isSubmitting) return;
    if (requiresPhone) {
      const value = guestPhone.trim();
      if (!value) return setPhoneError(PHONE_REQUIRED_MESSAGE);
      if (!validators.vnMobile(value)) return setPhoneError(PHONE_INVALID_MESSAGE);
      setPhoneError(null);
      void onBook(value);
      return;
    }
    void onBook('');
  };
  // calculate total amount
  const totalAmount = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

  if (selectedSlots.length === 0) return null;

  // Format the display text for selected slot
  // Let's sort slots by startTime
  const sortedSlots = [...selectedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  // Group consecutive slots by court
  let slotText: string;
  let courtText: string;

  const uniqueCourts = Array.from(new Set(sortedSlots.map(s => s.courtName)));
  
  if (uniqueCourts.length === 1) {
    const courtName = uniqueCourts[0];
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    
    const startDisp = formatTimeAMPM(firstSlot.startTime);
    const endDisp = formatTimeAMPM(lastSlot.endTime);
    
    slotText = `${startDisp} - ${endDisp}`;
    courtText = `${courtName} • ${venueName}`;
  } else {
    // Multiple courts or non-consecutive
    slotText = `Đã chọn ${sortedSlots.length} khung giờ`;
    courtText = `${uniqueCourts.join(', ')} • ${venueName}`;
  }

  return (
    <div className="fixed bottom-20 left-1/2 z-[60] w-[calc(100%-16px)] -translate-x-1/2 sm:bottom-6 sm:w-[calc(100%-32px)]">
      <div className="flex max-h-[62vh] flex-col gap-3 overflow-y-auto rounded-2xl border border-outline-variant/30 bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] sm:p-4 md:max-w-[1520px] md:mx-auto md:flex-row md:items-center md:justify-between md:gap-4 md:px-6 md:py-4">
        <div className="flex w-full min-w-0 items-center gap-3 md:w-auto md:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-12 sm:w-12">
            <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-on-surface sm:text-body-md md:text-body-lg">
              Khung giờ đã chọn: <span className="text-primary">{slotText}</span>
            </div>
            <div className="truncate text-xs text-on-surface-variant sm:text-sm">
              {courtText}
            </div>
          </div>
        </div>
        
        <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 pt-3 md:w-auto md:justify-end md:gap-6 md:border-t-0 md:pt-0">
          <div className="text-left md:text-right">
            <div className="text-on-surface-variant text-[12px] font-medium uppercase tracking-wider">Tổng tiền</div>
            <div className="text-xl font-bold text-primary sm:text-2xl md:text-3xl">
              {formatCurrency(totalAmount)}
            </div>
            {error ? (
              <div className="text-destructive text-xs font-medium mt-1 max-w-72">{error}</div>
            ) : null}
          </div>
          {hold ? (
            <>
              <div className="text-left md:text-right" role="timer" aria-live="off">
                <div className="text-on-surface-variant text-[12px] font-medium uppercase tracking-wider">Giữ chỗ còn</div>
                <div className={`text-xl font-bold tabular-nums sm:text-2xl ${hold.isWarning ? 'text-destructive' : 'text-primary'}`}>
                  {hold.countdown}
                </div>
              </div>
              <button
                type="button"
                disabled={hold.isReleasing}
                onClick={hold.onRelease}
                className="w-full shrink-0 cursor-pointer rounded-xl border border-outline-variant/60 bg-white px-4 py-3 text-sm font-bold text-on-surface transition-all duration-200 hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6 sm:text-body-sm"
              >
                {hold.isReleasing ? 'Đang hủy...' : 'Hủy giữ chỗ'}
              </button>
              <button
                type="button"
                disabled={hold.isReleasing}
                onClick={hold.onContinue}
                className="primary-gradient w-full shrink-0 cursor-pointer rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6 sm:text-body-sm"
              >
                Tiếp tục thanh toán
              </button>
            </>
          ) : (
            <>
              {requiresPhone ? (
                <div className="w-full sm:w-72">
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(event) => {
                      setGuestPhone(event.target.value);
                      if (phoneError) setPhoneError(null);
                    }}
                    placeholder="Số điện thoại liên hệ"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={15}
                    aria-label="Số điện thoại liên hệ"
                    aria-invalid={phoneError ? true : undefined}
                    aria-describedby={phoneError ? 'booking-phone-error' : undefined}
                    className={`h-12 w-full min-w-0 rounded-xl border bg-white px-4 text-base font-medium text-on-surface outline-none focus:ring-2 ${
                      phoneError
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                        : 'border-outline-variant/60 focus:border-primary focus:ring-primary/15'
                    }`}
                  />
                  {phoneError ? (
                    <p id="booking-phone-error" role="alert" className="mt-1 text-xs font-medium text-destructive">
                      {phoneError}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <button
                disabled={isSubmitting}
                onClick={submit}
                className="primary-gradient w-full shrink-0 cursor-pointer rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6 sm:text-body-sm"
              >
                {isSubmitting ? 'Đang giữ khung giờ...' : 'Giữ chỗ khung giờ đã chọn'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeAMPM(time24: string) {
  const parts = time24.split(':');
  const hour = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  return `${String(hour).padStart(2, '0')}:${minutes}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}
