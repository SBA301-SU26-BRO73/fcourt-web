import { useRef } from 'react';
import type { CourtSlot } from '@/types/public-branch';
import type { SelectedSlot } from './booking-panel';
import { formatLocalDate, parseLocalDate } from '@/common/utils/local-date';

export interface Court {
  id: number;
  name: string;
  type: string;
}

interface CourtAvailabilityGridProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedSlots: SelectedSlot[];
  onSlotClick: (court: Court, slot: CourtSlot) => void;
  courtSchedules: Record<number, CourtSlot[]>;
  /** While a hold is active the selection is frozen: release the hold to pick other slots. */
  locked?: boolean;
  courts: Court[];
  timeSlots: string[];
}

export default function CourtAvailabilityGrid({
  selectedDate,
  onDateChange,
  selectedSlots,
  onSlotClick,
  courtSchedules,
  courts,
  timeSlots,
  locked = false,
}: CourtAvailabilityGridProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleCustomDateClick = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch {
        dateInputRef.current.click();
      }
    }
  };

  // Generate 8 days starting from today
  const dates = getNext8Days();

  const isSelectedDateInList = dates.some(d => d.dateStr === selectedDate);
  const getCustomButtonDisplay = () => {
    if (!isSelectedDateInList && selectedDate) {
      const d = parseLocalDate(selectedDate);
      const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      return {
        dayName: daysOfWeek[d.getDay()],
        dayNum: d.getDate(),
        active: true
      };
    }
    return {
      dayName: 'Chọn ngày',
      dayNum: null,
      active: false
    };
  };
  const customDisplay = getCustomButtonDisplay();

  const daySlots = courts.flatMap((court) => courtSchedules[court.id] ?? []);
  const lowestPrice = daySlots.reduce((lowest, slot) => Math.min(lowest, slot.price), Infinity);
  const peakTimes = new Set(
    daySlots.filter((slot) => slot.price > lowestPrice).map((slot) => slot.startTime.slice(0, 5)),
  );

  // Check if a slot is selected
  const isSelected = (courtId: number, slotId: number | undefined) =>
    slotId !== undefined &&
    selectedSlots.some(
      (slot) => slot.courtId === courtId && slot.slotId === slotId && slot.date === selectedDate,
    );

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2 thin-scrollbar scroll-smooth">
        {dates.map((d) => {
          const active = d.dateStr === selectedDate;
          return (
            <button
              key={d.dateStr}
              onClick={() => onDateChange(d.dateStr)}
              className={`flex flex-col items-center justify-center min-w-[76px] h-[76px] rounded-2xl border transition-all duration-200 cursor-pointer ${
                active
                  ? 'bg-primary text-white border-primary shadow-lg scale-105'
                  : 'bg-white text-on-surface border-outline-variant/40 hover:border-primary/50'
              }`}
            >
              <span className={`text-[11px] font-bold tracking-wider uppercase ${active ? 'text-white/80' : 'text-on-surface-variant'}`}>
                {d.dayName}
              </span>
              <span className="text-xl font-bold mt-0.5">
                {d.dayNum}
              </span>
            </button>
          );
        })}

        {/* Custom Date Picker Card */}
        <div 
          onClick={handleCustomDateClick}
          className={`relative flex flex-col items-center justify-center min-w-[76px] h-[76px] rounded-2xl border transition-all duration-200 cursor-pointer ${
            customDisplay.active
              ? 'bg-primary text-white border-primary shadow-lg scale-105'
              : 'bg-white text-on-surface border-outline-variant/40 hover:border-primary/50'
          }`}
        >
          <span className={`text-[11px] font-bold tracking-wider uppercase pointer-events-none select-none ${customDisplay.active ? 'text-white/80' : 'text-on-surface-variant'}`}>
            {customDisplay.dayName}
          </span>
          {customDisplay.dayNum !== null ? (
            <span className="text-xl font-bold mt-0.5 pointer-events-none select-none">{customDisplay.dayNum}</span>
          ) : (
            <span className="material-symbols-outlined text-[20px] mt-0.5 text-primary pointer-events-none select-none">
              calendar_month
            </span>
          )}
          <input
            ref={dateInputRef}
            type="date"
            min={dates[0]?.dateStr}
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                onDateChange(e.target.value);
              }
            }}
            className="absolute opacity-0 pointer-events-none"
            style={{ width: '1px', height: '1px', pointerEvents: 'none' }}
          />
        </div>
      </div>

      {/* Grid Container */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-scroll thin-scrollbar relative">
          <div className="min-w-max">
            {/* Grid Header */}
            <div className="flex border-b border-outline-variant/30">
              {/* Sticky Top-Left Corner */}
              <div className="sticky left-0 z-30 bg-white border-r border-outline-variant/30 w-[180px] h-16 flex items-center px-4">
                <span className="font-bold text-on-surface text-body-md">Sân</span>
              </div>

              {/* Time Headers */}
              {timeSlots.map((time) => {
                const peak = peakTimes.has(time);
                return (
                  <div
                    key={time}
                    className="w-[80px] h-16 flex flex-col items-center justify-center shrink-0 border-r border-outline-variant/10 select-none"
                  >
                    <span className="font-bold text-on-surface text-body-sm">{time}</span>
                    {peak && (
                      <span className="text-[10px] font-bold text-[#008096] tracking-widest mt-0.5 uppercase">
                        CAO ĐIỂM
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grid Body */}
            <div className="divide-y divide-outline-variant/30">
              {courts.map((court) => {
                const schedule = courtSchedules[court.id] || [];

                return (
                  <div key={court.id} id={`court-row-${court.id}`} className="flex">
                    {/* Sticky Court Info Column */}
                    <div className="sticky left-0 z-20 bg-white border-r border-outline-variant/30 w-[180px] h-20 flex flex-col justify-center px-4 shrink-0">
                      <span className="font-bold text-on-surface text-body-md">{court.name}</span>
                      <span className="text-[10px] font-medium text-on-surface-variant/70 tracking-wider uppercase mt-0.5">
                        {court.type}
                      </span>
                    </div>

                    {/* Time Cells */}
                    {timeSlots.map((time) => {
                      // Find API schedule slot
                      const apiSlot = schedule.find(s => s.startTime.slice(0, 5) === time);

                      // Status details
                      const status = apiSlot?.status ?? 'UNAVAILABLE';
                      const selected = isSelected(court.id, apiSlot?.slotId);

                      // eslint-disable-next-line no-useless-assignment
                      let cellStyle = '';
                      let content = null;
                      let disabled: boolean;

                      if (selected) {
                        // A selected slot may already show HOLD once it is held by this customer.
                        cellStyle = 'primary-gradient text-white border-primary/20 shadow-inner scale-[0.98]';
                        disabled = locked;
                        content = (
                          <span className="material-symbols-outlined text-white text-[20px] font-bold animate-scale-in">
                            check
                          </span>
                        );
                      } else if (status === 'UNAVAILABLE' || status === 'EXPIRED' || status === 'BOOKED' || status === 'OUT_OF_SERVICE') {
                        cellStyle = 'bg-gray-300 border-gray-300/50 text-on-surface-variant/30 cursor-not-allowed';
                        disabled = true;
                      } else if (status === 'HOLD') {
                        cellStyle = 'bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]/40 cursor-not-allowed';
                        disabled = true;
                        content = (
                          <span className="text-[10px] font-bold text-[#C2410C]/70 tracking-wider">
                            ĐANG GIỮ
                          </span>
                        );
                      } else {
                        // AVAILABLE
                        cellStyle = locked
                          ? 'bg-white border-outline-variant/10 opacity-60 cursor-not-allowed'
                          : 'bg-white hover:bg-primary/5 hover:border-primary/20 border-outline-variant/10 cursor-pointer';
                        disabled = locked;
                      }

                      return (
                        <div
                          key={time}
                          className="w-[80px] h-20 p-1.5 shrink-0 border-r border-outline-variant/10 flex items-center justify-center"
                        >
                          <button
                            disabled={disabled}
                            title={apiSlot?.restriction?.publicReason ?? undefined}
                            onClick={() => apiSlot && onSlotClick(court, apiSlot)}
                            className={`w-full h-full rounded-xl border flex items-center justify-center transition-all duration-150 select-none ${cellStyle}`}
                          >
                            {content}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-surface-container-lowest border-t border-outline-variant/30 px-6 py-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium text-on-surface-variant">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-outline-variant/40 bg-white"></div>
            <span>Còn trống (30 phút)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded primary-gradient"></div>
            <span>Đã chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-300 border border-gray-300/50"></div>
            <span>Không trống</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center">
              <span className="text-[8px] font-bold text-[#C2410C]">GIỮ</span>
            </div>
            <span>Đang giữ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-[#008096]/30 bg-[#008096]/10 flex items-center justify-center">
              <span className="text-[9px] font-bold text-[#008096]">Cao điểm</span>
            </div>
            <span>Cao điểm</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getNext8Days() {
  const dates = [];
  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  for (let i = 0; i < 8; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayName = daysOfWeek[d.getDay()];
    const dayNum = d.getDate();
    const formattedDate = formatLocalDate(d);
    dates.push({
      dateStr: formattedDate,
      dayName,
      dayNum,
    });
  }
  return dates;
}
