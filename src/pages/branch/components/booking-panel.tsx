import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublicCourtSlots } from '@/hooks/use-public-branches';
import { getApiErrorMessage } from '@/common/utils/api-error';
import type { PublicBranchDetail } from '@/types/public-branch';
import type { CourtView } from '../branch-detail.types';

interface BookingPanelProps {
  branch: PublicBranchDetail;
  courts: CourtView[];
}

export default function BookingPanel({ branch, courts }: BookingPanelProps) {
  const navigate = useNavigate();
  const activeCourts = courts;
  const todayStr = formatLocalDate(new Date());
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const slotsQuery = usePublicCourtSlots(selectedCourtId, selectedDate);
  const schedule = slotsQuery.data ?? [];
  const isLoadingSchedule = slotsQuery.isFetching;
  const scheduleError = slotsQuery.error ? getApiErrorMessage(slotsQuery.error, 'Không thể tải lịch sân.') : null;

  useEffect(() => {
    if (activeCourts.length > 0 && !activeCourts.some((court) => court.id === selectedCourtId)) {
      setSelectedCourtId(activeCourts[0].id);
    }
  }, [activeCourts, selectedCourtId]);

  useEffect(() => {
    setSelectedTime((current) => schedule.some((slot) => slot.startTime === current && slot.status === 'AVAILABLE')
      ? current
      : schedule.find((slot) => slot.status === 'AVAILABLE')?.startTime ?? '');
  }, [slotsQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBookNow = () => {
    if (!selectedCourtId || !selectedTime) return;
    const params = new URLSearchParams({
      branchId: branch.id.toString(),
      courtId: selectedCourtId.toString(),
      date: selectedDate,
      // Keep the slot-booking page URL in the same HH:mm format as its grid.
      startTime: selectedTime.slice(0, 5),
    });
    navigate(`/slot-booking?${params.toString()}`);
  };

  const availableSlots = schedule.filter((slot) => slot.status === 'AVAILABLE');
  const selectedSlot = schedule.find((slot) => slot.startTime === selectedTime && slot.status === 'AVAILABLE');
  const selectedCourt = activeCourts.find((court) => court.id === selectedCourtId);
  const mapQuery = [branch.name, branch.address, branch.city]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <aside className="hidden lg:block lg:col-span-4">
        <div className="sticky top-24 space-y-stack-lg">
          {/* Booking Panel */}
          <div className="bg-surface-container-lowest border border-outline-variant shadow-xl rounded-2xl p-stack-lg">
            <h3 className="font-headline-md text-headline-md mb-stack-md text-on-surface">Đặt sân nhanh</h3>
            <div className="space-y-stack-md">
              
              {/* Court Select */}
              <div className="p-stack-sm bg-surface-container rounded-lg border border-outline-variant/20">
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-unit uppercase tracking-wider">Sân</label>
                <select 
                  value={selectedCourtId ?? ''}
                  onChange={(e) => setSelectedCourtId(Number(e.target.value))}
                  className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md p-0 outline-none text-on-surface cursor-pointer"
                >
                  {activeCourts.length === 0 ? (
                    <option value="">Không có sân trống</option>
                  ) : (
                    activeCourts.map((court) => (
                      <option key={court.id} value={court.id}>{court.name} · {court.courtTypeName}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-stack-sm">
                <div className="p-stack-sm bg-surface-container rounded-lg border border-outline-variant/20">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-unit uppercase tracking-wider">Ngày</label>
                  <input 
                    className="w-full bg-transparent border-none focus:ring-0 font-body-sm text-body-sm p-0 outline-none text-on-surface cursor-pointer" 
                    type="date" 
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="p-stack-sm bg-surface-container rounded-lg border border-outline-variant/20">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-unit uppercase tracking-wider">Giờ</label>
                  <select 
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 font-body-sm text-body-sm p-0 outline-none text-on-surface cursor-pointer"
                    disabled={isLoadingSchedule || availableSlots.length === 0}
                  >
                    {isLoadingSchedule ? <option value="">Đang tải...</option> : availableSlots.length === 0 ? <option value="">Không có slot trống</option> : availableSlots.map((slot) => (
                      <option key={slot.startTime} value={slot.startTime}>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</option>
                    ))}
                  </select>
                </div>
              </div>
              {scheduleError && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {scheduleError}
                </div>
              )}

              {/* Checkout details */}
              <div className="border-t border-outline-variant/30 pt-stack-md mt-stack-md space-y-stack-xs text-on-surface">
                <div className="flex justify-between font-body-sm text-body-sm">
                  <span>Thuê sân 1 giờ</span>
                  <span className="font-medium">{selectedSlot ? formatCurrency(selectedSlot.price) : '—'}</span>
                </div>
                <div className="flex justify-between font-headline-md text-headline-md pt-stack-sm border-t border-outline-variant/10">
                  <span>Tổng cộng</span>
                  <span className="text-primary font-bold">{selectedSlot ? formatCurrency(selectedSlot.price) : '—'}</span>
                </div>
              </div>

              <button 
                onClick={handleBookNow}
                disabled={!branch.id || !selectedCourt || !selectedSlot || isLoadingSchedule}
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline-md text-headline-md hover:scale-[1.01] transition-transform shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đặt sân
              </button>
              <p className="text-center font-label-sm text-label-sm text-on-surface-variant">Có thể hủy trước tối thiểu 1 giờ</p>
            </div>
          </div>
  
          {/* Map Widget */}
          <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30 h-64 relative">
            <img alt="Location Map" className="w-full h-full object-cover grayscale opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMkrvVby7kQYEJp5pWMsPOmygwCErh6VUhvJ5MVZaY7CGn6hFWIZOeQ21xkTtoMJWkphNjKR9spdruuA7rVRB9nZk8Zy5HwkC6pKS4Z4Tf-BmV44ce-iEOCS23IEdEpRDiY_3dd9fz1v1Gh7Um74d0KTUem9CLYMkZS7UySoYaz_yot32zbzgbg3ocpGBXohiVqzC71jna5FQ5f6N1zQhopPdK5HxEnP41OaSu4RwjIcnOSMQAxbCuXTVWSFbW4jfAv-yHHTlreGg" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface/60 to-transparent flex items-end p-stack-md">
              <button 
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`, '_blank')}
                className="w-full bg-surface-container-lowest text-on-surface py-2 rounded-lg font-label-md text-label-md flex items-center justify-center gap-unit shadow-sm hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary">directions</span>
                Chỉ đường
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Floating Booking Button */}
      <div className="fixed bottom-24 right-4 lg:hidden z-40 flex">
        <button 
          onClick={handleBookNow}
          className="primary-gradient text-white flex items-center justify-center rounded-full shadow-2xl hover:scale-[1.05] transition-all p-4 px-6 gap-2 font-bold cursor-pointer"
        >
          <span className="material-symbols-outlined">bolt</span>
          <span>Đặt sân</span>
        </button>
      </div>
    </>
  );
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}
