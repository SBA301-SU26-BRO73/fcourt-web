import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CourtAvailabilityGrid from './components/court-availability-grid';
import type { Court } from './components/court-availability-grid';
import BookingPanel from './components/booking-panel';
import type { SelectedSlot } from './components/booking-panel';
import { branchApi } from '@/services/branch/branch.api';
import type { DailySlotResponse } from '@/services/branch/branch.api';
import { createBookings } from '@/services/booking/booking.api';
import { useAuth } from '@/hooks/use-auth-context';
import { formatLocalDate } from '@/common/utils/local-date';
import { getApiErrorMessage } from '@/common/utils/api-error';

export default function SlotBookingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticatedCustomer = user?.role === 'CUSTOMER';
  const [searchParams, setSearchParams] = useSearchParams();
  const branchIdParam = searchParams.get('branchId');
  const courtIdParam = searchParams.get('courtId');
  const dateParam = searchParams.get('date');
  const startTimeParam = searchParams.get('startTime');

  const todayStr = formatLocalDate(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(dateParam || todayStr);
  const [courtSchedules, setCourtSchedules] = useState<Record<number, DailySlotResponse[]>>({});
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const bookingInFlightRef = useRef(false);
  
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [venueName, setVenueName] = useState<string>('Đang tải cơ sở...');

  // Sync date selection with URL dateParam if it changes
  useEffect(() => {
    if (dateParam) {
      setSelectedDate(dateParam);
    }
  }, [dateParam]);

  // Load current branch details and its courts list
  useEffect(() => {
    const fetchBranchAndCourts = async () => {
      try {
        let activeBranchId = branchIdParam ? Number(branchIdParam) : null;
        
        if (!activeBranchId) {
          // If no branchId in URL, fetch first branch as default
          const data = await branchApi.getAll(0, 1);
          if (data && data.content && data.content.length > 0) {
            activeBranchId = data.content[0].id;
            setSearchParams({ branchId: activeBranchId.toString() });
          }
        }
        
        if (activeBranchId) {
          setSelectedBranchId(activeBranchId);
          
          // Fetch branch name
          const branchDetail = await branchApi.getById(activeBranchId);
          if (branchDetail) {
            setVenueName(branchDetail.name);
          }

          // Fetch courts list
          const apiCourts = await branchApi.getCourtsByBranch(activeBranchId);
          if (apiCourts) {
            const mappedCourts = apiCourts.map(c => ({
              id: c.id,
              name: c.name,
              type: c.courtTypeName || 'Trong nhà • Mặt sân cứng'
            }));
            setCourts(mappedCourts);
          }
        }
      } catch (err) {
        console.error('Error fetching branch details and courts:', err);
        setScheduleError(getApiErrorMessage(err, 'Không thể tải thông tin cơ sở.'));
      }
    };
    
    fetchBranchAndCourts();
  }, [branchIdParam, setSearchParams]);

  // Fetch schedules for each court of the selected branch
  useEffect(() => {
    if (courts.length === 0) {
      setCourtSchedules({});
      setIsLoading(false);
      return;
    }

    const fetchSchedules = async () => {
      setIsLoading(true);
      const newSchedules: Record<number, DailySlotResponse[]> = {};

      try {
        setScheduleError(null);
        await Promise.all(
          courts.map(async (court) => {
            const data = await branchApi.getDailyCourtSchedule(court.id, selectedDate);
            if (!Array.isArray(data)) {
            throw new Error('Dữ liệu lịch sân không hợp lệ');
            }
            newSchedules[court.id] = data;
          })
        );
        setCourtSchedules(newSchedules);
      } catch (err) {
        console.error('Error in fetching schedules:', err);
        setCourtSchedules({});
        setScheduleError(getApiErrorMessage(err, 'Không thể tải lịch sân. Vui lòng thử lại sau.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [courts, selectedDate]);

  useEffect(() => {
    if (!startTimeParam || !courtIdParam || selectedSlots.length > 0 || isLoading) return;
    const courtId = Number(courtIdParam);
    const slot = courtSchedules[courtId]?.find((item) => item.startTime === startTimeParam && item.status === 'AVAILABLE');
    const court = courts.find((item) => item.id === courtId);
    if (!slot || !court) return;

    setSelectedSlots([{
      courtId: court.id,
      courtName: court.name,
      startTime: toDisplayTime(slot.startTime),
      endTime: toDisplayTime(slot.endTime),
      price: slot.price,
      date: selectedDate,
    }]);
  }, [startTimeParam, courtIdParam, selectedDate, courtSchedules, courts, selectedSlots.length, isLoading]);

  // Scroll to specific court row if courtId is in query params
  useEffect(() => {
    if (courtIdParam && courts.length > 0 && !isLoading) {
      const timer = setTimeout(() => {
        const rowElement = document.getElementById(`court-row-${courtIdParam}`);
        if (rowElement) {
          rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight row temporarily
          rowElement.classList.add('bg-primary/5');
          setTimeout(() => {
            rowElement.classList.remove('bg-primary/5');
          }, 2000);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [courtIdParam, courts, isLoading]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    
    const updatedParams: Record<string, string> = { 
      branchId: selectedBranchId?.toString() || '' 
    };
    if (newDate !== todayStr) {
      updatedParams.date = newDate;
    }
    setSearchParams(updatedParams);
  };

  const handleSlotClick = (court: Court, timeStr: string, price: number, endTimeStr: string) => {
    const startTime = normalizeTime(timeStr);
    const endTime = normalizeTime(endTimeStr);

    setSelectedSlots((current) => {
      const isAlreadySelected = current.some(
        (slot) =>
          slot.courtId === court.id &&
          normalizeTime(slot.startTime) === startTime &&
          slot.date === selectedDate,
      );

      if (isAlreadySelected) {
        return current.filter(
          (slot) =>
            !(
              slot.courtId === court.id &&
              normalizeTime(slot.startTime) === startTime &&
              slot.date === selectedDate
            ),
        );
      }

      return [
        ...current,
        {
          courtId: court.id,
          courtName: court.name,
          startTime,
          endTime,
          price,
          date: selectedDate,
        },
      ];
    });
  };

  const handleBook = async (guestPhone?: string) => {
    if (bookingInFlightRef.current) return;

    setBookingError(null);
    const trimmedPhone = guestPhone?.trim() ?? '';
    if (!isAuthenticatedCustomer && !/^[0-9]{9,11}$/.test(trimmedPhone)) {
      setBookingError('Vui lòng nhập số điện thoại 9-11 chữ số.');
      return;
    }

    try {
      bookingInFlightRef.current = true;
      setIsBooking(true);
      const response = await createBookings({
        ...(isAuthenticatedCustomer ? {} : { guestPhone: trimmedPhone }),
        bookings: buildBookingItems(selectedSlots),
      });
      navigate(`/payment?bookingId=${response.bookings[0].id}`, { state: { booking: response } });
    } catch (error) {
      setBookingError(getApiErrorMessage(error, 'Không thể tạo booking.'));
    } finally {
      bookingInFlightRef.current = false;
      setIsBooking(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 py-5 pb-40 sm:px-4 sm:py-8 md:px-8 md:pb-32">
      <div className="mb-5 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-headline-lg font-bold text-on-surface sm:text-3xl">Lịch sân trống</h1>
          <p className="mt-1 text-sm text-on-surface-variant sm:text-body-md">Chọn ngày và khung giờ phù hợp để đặt sân.</p>
        </div>
        
        {/* Branch Name Static Label */}
        <div className="relative shrink-0">
          <div className="flex max-w-full items-center gap-2 truncate rounded-xl border border-outline-variant/60 bg-white px-3 py-2.5 text-sm font-bold text-on-surface shadow-sm select-none sm:px-4 sm:text-label-md">
            <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
            <span className="truncate">{venueName}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-on-surface-variant font-medium text-body-md">Đang tải lịch sân...</span>
        </div>
      ) : courts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-outline-variant/30 rounded-2xl bg-white shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant/40 text-5xl mb-4">sports_tennis</span>
          <h3 className="text-xl font-bold text-on-surface">Không có sân trống</h3>
          <p className="text-on-surface-variant text-sm mt-1">Cơ sở này chưa đăng ký sân nào.</p>
        </div>
      ) : scheduleError ? (
          <div className="flex flex-col items-center justify-center py-24 border border-destructive/20 rounded-2xl bg-destructive/5">
            <h3 className="text-xl font-bold text-destructive">Không thể tải lịch sân</h3>
            <p className="text-sm text-muted-foreground mt-2">{scheduleError}</p>
            <button
              type="button"
              onClick={() => setSelectedDate((date) => date)}
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Thử lại
            </button>
          </div>
        ) : getScheduleStartTimes(courtSchedules).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-outline-variant/30 rounded-2xl bg-white shadow-sm">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-5xl mb-4">schedule</span>
            <h3 className="text-xl font-bold text-on-surface">Không có khung giờ trống</h3>
            <p className="text-on-surface-variant text-sm mt-1">Cơ sở này chưa có khung giờ hoạt động trong ngày đã chọn.</p>
          </div>
        ) : (
          <CourtAvailabilityGrid
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            selectedSlots={selectedSlots}
            onSlotClick={handleSlotClick}
            courtSchedules={courtSchedules}
            courts={courts}
            timeSlots={getScheduleStartTimes(courtSchedules)}
          />
        )}

      <BookingPanel
        selectedSlots={selectedSlots}
        venueName={venueName}
        onBook={handleBook}
        requiresGuestPhone={!isAuthenticatedCustomer}
        isSubmitting={isBooking}
        error={bookingError}
      />
    </div>
  );
}

function getScheduleStartTimes(schedules: Record<number, DailySlotResponse[]>) {
  return Array.from(new Set(
    Object.values(schedules)
      .flat()
      .map((slot) => slot.startTime.slice(0, 5)),
  )).sort((a, b) => toMinutes(a) - toMinutes(b));
}

function normalizeTime(time: string) {
  const [hour = '00', minute = '00'] = time.split(':');
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
}

/** The booking UI stores and compares all slot times as HH:mm. */
function toDisplayTime(time: string) {
  return time.slice(0, 5);
}

function toMinutes(time: string) {
  const [hour = '0', minute = '0'] = time.split(':');
  return Number(hour) * 60 + Number(minute);
}

function buildBookingItems(selectedSlots: SelectedSlot[]) {
  const grouped = new Map<string, SelectedSlot[]>();
  selectedSlots.forEach((slot) => {
    const key = `${slot.courtId}|${slot.date}`;
    grouped.set(key, [...(grouped.get(key) ?? []), slot]);
  });

  return Array.from(grouped.values()).map((slots) => {
    const ordered = [...slots].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    const slotStarts = Array.from(new Set(ordered.map((slot) => normalizeTime(slot.startTime))));

    return {
      courtId: ordered[0].courtId,
      date: ordered[0].date,
      slotStarts,
    };
  });
}
