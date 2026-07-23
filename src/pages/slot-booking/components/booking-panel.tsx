import { useState } from 'react';

export interface SelectedSlot {
  courtId: number;
  courtName: string;
  startTime: string; // "HH:MM:SS" or "HH:MM"
  endTime: string;
  price: number;
  date: string;
}

interface BookingPanelProps {
  selectedSlots: SelectedSlot[];
  venueName: string;
  onBook: (guestPhone?: string) => void | Promise<void>;
  requiresGuestPhone?: boolean;
  isSubmitting?: boolean;
  error?: string | null;
}

export default function BookingPanel({ selectedSlots, venueName, onBook, requiresGuestPhone = true, isSubmitting = false, error }: BookingPanelProps) {
  const [guestPhone, setGuestPhone] = useState('');
  // calculate total amount
  const totalAmount = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

  if (selectedSlots.length === 0) return null;

  // Format the display text for selected slot
  // Let's sort slots by startTime
  const sortedSlots = [...selectedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  // Group consecutive slots by court
  let slotText = '';
  let courtText = '';

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
          {requiresGuestPhone ? (
            <input
              value={guestPhone}
              onChange={(event) => setGuestPhone(event.target.value)}
              placeholder="Số điện thoại"
              inputMode="numeric"
              className="h-11 w-full min-w-0 rounded-xl border border-outline-variant/60 bg-white px-3 text-sm font-medium text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 sm:w-44"
            />
          ) : (
            <span className="text-xs font-medium text-on-surface-variant sm:text-sm">Đặt bằng tài khoản</span>
          )}
          
          <button 
            disabled={isSubmitting}
            onClick={() => onBook(requiresGuestPhone ? guestPhone : undefined)}
            className="primary-gradient w-full shrink-0 cursor-pointer rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6 sm:text-body-sm"
          >
            {isSubmitting ? 'Đang giữ khung giờ...' : 'Đặt khung giờ đã chọn'}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTimeAMPM(time24: string) {
  const parts = time24.split(':');
  let hour = parseInt(parts[0], 10);
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
