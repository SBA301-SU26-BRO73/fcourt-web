import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CourtAvailabilityGrid from './components/court-availability-grid';
import type { Court } from './components/court-availability-grid';
import BookingPanel from './components/booking-panel';
import type { SelectedSlot } from './components/booking-panel';
import { branchApi } from '@/services/branch/branch.api';
import type { DailySlotResponse } from '@/services/branch/branch.api';

const EXTENDED_TIMESLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

export default function SlotBookingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const branchIdParam = searchParams.get('branchId');
  const courtIdParam = searchParams.get('courtId');
  const dateParam = searchParams.get('date');

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(dateParam || todayStr);
  const [courtSchedules, setCourtSchedules] = useState<Record<number, DailySlotResponse[]>>({});
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [venueName, setVenueName] = useState<string>('Loading Branch...');

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
              type: c.courtTypeName || 'Indoor • Hard'
            }));
            setCourts(mappedCourts);
          }
        }
      } catch (err) {
        console.error('Error fetching branch details and courts:', err);
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
        await Promise.all(
          courts.map(async (court) => {
            try {
              // Try fetching from actual backend endpoint
              const data = await branchApi.getDailyCourtSchedule(court.id, selectedDate);
              if (data && Array.isArray(data)) {
                newSchedules[court.id] = data;
              } else {
                newSchedules[court.id] = generateMockSchedule(court.id, selectedDate);
              }
            } catch (err) {
              // Fallback to mock schedule if backend isn't running or endpoint doesn't exist
              newSchedules[court.id] = generateMockSchedule(court.id, selectedDate);
            }
          })
        );
        setCourtSchedules(newSchedules);
      } catch (err) {
        console.error('Error in fetching schedules:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [courts, selectedDate]);

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

  const handleSlotClick = (court: Court, timeStr: string, price: number) => {
    const [hh, mm] = timeStr.split(':').map(Number);
    let endH = hh;
    let endM = mm + 30;
    if (endM >= 60) {
      endH += 1;
      endM = 0;
    }
    const endTimeStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    const isAlreadySelected = selectedSlots.some(
      (s) => s.courtId === court.id && s.startTime === timeStr && s.date === selectedDate
    );

    if (isAlreadySelected) {
      setSelectedSlots(
        selectedSlots.filter(
          (s) => !(s.courtId === court.id && s.startTime === timeStr && s.date === selectedDate)
        )
      );
    } else {
      setSelectedSlots([
        ...selectedSlots,
        {
          courtId: court.id,
          courtName: court.name,
          startTime: timeStr,
          endTime: endTimeStr,
          price,
          date: selectedDate,
        },
      ]);
    }
  };

  const handleBook = () => {
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setSelectedSlots([]); // Clear selection on booking success
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 py-8 md:px-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-headline-lg font-bold text-on-surface">Court Availability</h1>
          <p className="text-on-surface-variant mt-1 text-body-md">Find and book your perfect match time.</p>
        </div>
        
        {/* Branch Name Static Label */}
        <div className="relative shrink-0">
          <div className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant/60 rounded-xl bg-white text-on-surface text-label-md font-bold shadow-sm select-none">
            <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
            <span>{venueName}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-on-surface-variant font-medium text-body-md">Loading schedules...</span>
        </div>
      ) : courts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-outline-variant/30 rounded-2xl bg-white shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant/40 text-5xl mb-4">sports_tennis</span>
          <h3 className="text-xl font-bold text-on-surface">No Courts Available</h3>
          <p className="text-on-surface-variant text-sm mt-1">There are no courts registered at this branch location.</p>
        </div>
      ) : (
        <CourtAvailabilityGrid
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          selectedSlots={selectedSlots}
          onSlotClick={handleSlotClick}
          courtSchedules={courtSchedules}
          courts={courts}
          timeSlots={EXTENDED_TIMESLOTS}
        />
      )}

      <BookingPanel
        selectedSlots={selectedSlots}
        venueName={venueName}
        onBook={handleBook}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-secondary-container/20 rounded-full flex items-center justify-center text-secondary mb-4">
              <span className="material-symbols-outlined text-[40px] font-bold">check_circle</span>
            </div>
            <h3 className="text-2xl font-bold text-on-surface">Booking Confirmed!</h3>
            <p className="text-on-surface-variant text-sm mt-2">
              Your court reservation at <strong>{venueName}</strong> has been successfully booked.
            </p>
            
            <div className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 my-6 text-left space-y-2 text-sm">
              <div className="flex justify-between border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface-variant font-medium">Selected Date:</span>
                <span className="font-bold text-on-surface">{selectedDate}</span>
              </div>
              <div className="max-h-36 overflow-y-auto pr-1 space-y-1">
                {selectedSlots.map((s, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">{s.courtName} ({s.startTime} - {s.endTime})</span>
                    <span className="font-bold text-on-surface">${s.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-outline-variant/20 pt-2 font-bold text-base">
                <span>Total Paid:</span>
                <span className="text-primary">${selectedSlots.reduce((sum, s) => sum + s.price, 0).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/95 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Mock Schedule generator
const generateMockSchedule = (courtId: number, dateStr: string): DailySlotResponse[] => {
  const slots: DailySlotResponse[] = [];
  let currentHour = 7;
  let currentMinute = 0;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHH = now.getHours();
  const currentMM = now.getMinutes();

  while (currentHour < 22 || (currentHour === 22 && currentMinute === 0)) {
    const hh = currentHour.toString().padStart(2, '0');
    const mm = currentMinute.toString().padStart(2, '0');
    const startTimeStr = `${hh}:${mm}:00`;
    
    let endHour = currentHour;
    let endMinute = currentMinute + 30;
    if (endMinute >= 60) {
      endHour += 1;
      endMinute = 0;
    }
    const endHH = endHour.toString().padStart(2, '0');
    const endMM = endMinute.toString().padStart(2, '0');
    const endTimeStr = `${endHH}:${endMM}:00`;

    const isPeak = ['09:00', '09:30', '10:00', '10:30'].includes(`${hh}:${mm}`);
    const price = isPeak ? 22.50 : 18.75;

    let status: 'AVAILABLE' | 'BOOKED' | 'HOLDING' | 'EXPIRED' = 'AVAILABLE';
    
    if (dateStr === todayStr) {
      if (currentHour < currentHH || (currentHour === currentHH && currentMinute < currentMM)) {
        status = 'EXPIRED';
      }
    }

    const isMockBooked = (courtId % 3 === 0 && (startTimeStr === '11:30:00' || startTimeStr === '12:00:00' || startTimeStr === '15:00:00')) ||
                         (courtId % 3 === 1 && (startTimeStr === '08:00:00' || startTimeStr === '10:30:00' || startTimeStr === '14:00:00')) ||
                         (courtId % 3 === 2 && (startTimeStr === '09:30:00' || startTimeStr === '13:00:00' || startTimeStr === '16:30:00'));

    const isMockHolding = (courtId % 3 === 0 && startTimeStr === '10:00:00') ||
                          (courtId % 3 === 1 && startTimeStr === '16:00:00') ||
                          (courtId % 3 === 2 && startTimeStr === '14:30:00');

    if (isMockBooked) {
      status = 'BOOKED';
    } else if (isMockHolding) {
      status = 'HOLDING';
    }

    slots.push({
      startTime: startTimeStr,
      endTime: endTimeStr,
      price,
      status,
    });

    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute = 0;
    }
  }

  return slots;
};
