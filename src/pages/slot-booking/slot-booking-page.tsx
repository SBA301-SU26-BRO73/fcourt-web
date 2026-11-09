import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import CourtAvailabilityGrid from './components/court-availability-grid';
import type { Court } from './components/court-availability-grid';
import BookingPanel, { PHONE_INVALID_MESSAGE, PHONE_REQUIRED_MESSAGE } from './components/booking-panel';
import type { SelectedSlot } from './components/booking-panel';
import { toggleSlot, toHHmm, toMinutes } from './slot-selection';
import { useAuth } from '@/hooks/use-auth-context';
import { useCourtTypes } from '@/hooks/use-court-types';
import {
  publicBranchKeys,
  usePublicBranch,
  usePublicBranchCourts,
  usePublicBranchSearch,
  usePublicCourtsSlots,
} from '@/hooks/use-public-branches';
import { useSlotHold } from '@/hooks/use-slot-hold';
import { useSlotRealtime } from '@/hooks/use-slot-realtime';
import { formatLocalDate } from '@/common/utils/local-date';
import { getApiErrorMessage, isApiError, toastApiError } from '@/common/utils/api-error';
import { validators } from '@/utils/validators';
import { formatCountdown } from '@/utils/hold-countdown';
import type { ActiveHold } from '@/types/hold';
import type { CourtSlot } from '@/types/public-branch';

export default function SlotBookingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAuthenticatedCustomer = user?.role === 'CUSTOMER';
  const [searchParams, setSearchParams] = useSearchParams();
  const branchIdParam = searchParams.get('branchId');
  const courtIdParam = searchParams.get('courtId');
  const dateParam = searchParams.get('date');
  const startTimeParam = searchParams.get('startTime');

  const todayStr = formatLocalDate(new Date());
  // null = untouched, so the slot linked from the branch page can be preselected without an effect.
  const [pickedState, setPicked] = useState<SelectedSlot[] | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const refreshSlots = () => queryClient.invalidateQueries({ queryKey: ['public-courts', 'slots'] });

  const {
    status: holdStatus,
    hold,
    remaining,
    isWarning,
    isBusy,
    start: startHold,
    release: releaseHold,
    dismissExpired,
  } = useSlotHold({
    onExpired: () => {
      toast.warning('Đã hết thời gian giữ chỗ. Vui lòng chọn lại khung giờ.');
      setPicked([]);
      void refreshSlots();
    },
  });

  // The day comes from the URL; a restored hold decides the day and the branch.
  const selectedDate = hold?.date ?? dateParam ?? todayStr;
  useEffect(() => {
    if (hold?.branchId && branchIdParam !== String(hold.branchId)) {
      setSearchParams(
        { branchId: String(hold.branchId), ...(hold.date !== todayStr ? { date: hold.date } : {}) },
        { replace: true },
      );
    }
  }, [hold, branchIdParam, todayStr, setSearchParams]);

  // No branch in the URL: fall back to the first listed branch.
  const fallbackBranch = usePublicBranchSearch({ page: 0, size: 1 });
  useEffect(() => {
    if (branchIdParam) return;
    const first = fallbackBranch.data?.content[0];
    if (first) setSearchParams({ branchId: String(first.id) }, { replace: true });
  }, [branchIdParam, fallbackBranch.data, setSearchParams]);

  const selectedBranchId = branchIdParam ? Number(branchIdParam) : null;
  const branchQuery = usePublicBranch(branchIdParam ?? undefined);
  const courtsQuery = usePublicBranchCourts(branchIdParam ?? undefined);
  const courtTypesQuery = useCourtTypes();

  const venueName = branchQuery.data?.name ?? 'Đang tải cơ sở...';
  const courts = useMemo<Court[]>(() => {
    const names = new Map((courtTypesQuery.data?.content ?? []).map((type) => [type.id, type.name]));
    return (courtsQuery.data ?? []).map((court) => ({
      id: court.id,
      name: court.name,
      type: names.get(court.courtTypeId) || 'Sân thể thao',
    }));
  }, [courtsQuery.data, courtTypesQuery.data]);
  const courtIds = useMemo(() => courts.map((court) => court.id), [courts]);

  const { slotsByCourt, isLoading: slotsLoading, error: slotsError, refetch } = usePublicCourtsSlots(courtIds, selectedDate);
  useSlotRealtime(courtIds, selectedDate);

  const isLoading = branchQuery.isLoading || courtsQuery.isLoading || (courts.length > 0 && slotsLoading);
  const scheduleError = slotsError || branchQuery.error || courtsQuery.error
    ? getApiErrorMessage(slotsError || branchQuery.error || courtsQuery.error, 'Không thể tải lịch sân. Vui lòng thử lại sau.')
    : null;

  // The slot the branch page linked to (court + startTime), until the customer picks something.
  const linked = useMemo<SelectedSlot[]>(() => {
    if (!startTimeParam || !courtIdParam || slotsLoading) return [];
    const courtId = Number(courtIdParam);
    const court = courts.find((item) => item.id === courtId);
    const slot = slotsByCourt[courtId]?.find((item) => toHHmm(item.startTime) === startTimeParam && item.status === 'AVAILABLE');
    return court && slot ? [toSelected(court, slot, selectedDate)] : [];
  }, [startTimeParam, courtIdParam, selectedDate, slotsByCourt, courts, slotsLoading]);
  const picked = pickedState ?? linked;
  const selectedSlots = useMemo(() => (hold ? holdToSelected(hold) : picked), [hold, picked]);

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
    if (hold) return;
    setPicked([]);
    setBookingError(null);

    const updatedParams: Record<string, string> = {
      branchId: selectedBranchId?.toString() || '',
    };
    if (newDate !== todayStr) {
      updatedParams.date = newDate;
    }
    setSearchParams(updatedParams);
  };

  const handleSlotClick = (court: Court, slot: CourtSlot) => {
    if (hold) return;
    setBookingError(null);
    const result = toggleSlot(picked, toSelected(court, slot, selectedDate));
    setPicked(result.slots);
    if (result.notice) toast.info(result.notice);
  };

  const handleHold = async (phone: string) => {
    if (isBusy || hold || selectedSlots.length === 0) return;

    setBookingError(null);
    const guestPhone = phone.trim();
    // A signed-in customer may hold without a phone (booking-service knows the account); a guest must give one.
    const phoneOptional = isAuthenticatedCustomer && guestPhone === '';
    if (!phoneOptional && !validators.vnMobile(guestPhone)) {
      setBookingError(guestPhone ? PHONE_INVALID_MESSAGE : PHONE_REQUIRED_MESSAGE);
      return;
    }

    const first = selectedSlots[0];
    try {
      await startHold({
        courtId: first.courtId,
        courtName: first.courtName,
        branchId: selectedBranchId,
        branchName: venueName,
        date: first.date,
        guestPhone,
        slots: selectedSlots.map((slot) => ({
          slotId: slot.slotId,
          startTime: toHHmm(slot.startTime),
          endTime: toHHmm(slot.endTime),
          price: slot.price,
        })),
      });
      setPicked([]);
      void refreshSlots();
    } catch (error) {
      if (isApiError(error) && error.status === 409) {
        setBookingError('Có khung giờ vừa được người khác giữ hoặc đặt. Vui lòng chọn lại.');
        setPicked([]);
        void refreshSlots();
      } else {
        setBookingError(getApiErrorMessage(error, 'Không thể giữ chỗ. Vui lòng thử lại.'));
      }
    }
  };

  const handleRelease = async () => {
    try {
      await releaseHold();
      toast.success('Đã hủy giữ chỗ.');
    } catch (error) {
      toastApiError(error, 'Không thể hủy giữ chỗ trên máy chủ. Khung giờ sẽ tự mở lại khi hết hạn.');
    } finally {
      setPicked([]);
      void refreshSlots();
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

      {holdStatus === 'expired' ? (
        <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
          <span>Phiên giữ chỗ đã hết hạn. Khung giờ đã được mở lại cho mọi người.</span>
          <button type="button" onClick={dismissExpired} className="shrink-0 font-bold underline">Đóng</button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-on-surface-variant font-medium text-body-md">Đang tải lịch sân...</span>
        </div>
      ) : scheduleError ? (
          <div className="flex flex-col items-center justify-center py-24 border border-destructive/20 rounded-2xl bg-destructive/5">
            <h3 className="text-xl font-bold text-destructive">Không thể tải lịch sân</h3>
            <p className="text-sm text-muted-foreground mt-2">{scheduleError}</p>
            <button
              type="button"
              onClick={() => {
                void queryClient.invalidateQueries({ queryKey: publicBranchKeys.all });
                void refetch();
              }}
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Thử lại
            </button>
          </div>
        ) : courts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-outline-variant/30 rounded-2xl bg-white shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant/40 text-5xl mb-4">sports_tennis</span>
          <h3 className="text-xl font-bold text-on-surface">Không có sân trống</h3>
          <p className="text-on-surface-variant text-sm mt-1">Cơ sở này chưa đăng ký sân nào.</p>
        </div>
      ) : getScheduleStartTimes(slotsByCourt).length === 0 ? (
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
            courtSchedules={slotsByCourt}
            courts={courts}
            timeSlots={getScheduleStartTimes(slotsByCourt)}
            locked={Boolean(hold) || isBusy}
          />
        )}

      <BookingPanel
        selectedSlots={selectedSlots}
        venueName={venueName}
        onBook={handleHold}
        requiresPhone={!isAuthenticatedCustomer}
        isSubmitting={holdStatus === 'holding'}
        error={bookingError}
        hold={hold ? {
          countdown: formatCountdown(remaining),
          isWarning,
          isReleasing: holdStatus === 'releasing',
          onRelease: handleRelease,
          onContinue: () => navigate('/payment'),
        } : null}
      />
    </div>
  );
}

function toSelected(court: Court, slot: CourtSlot, date: string): SelectedSlot {
  return {
    slotId: slot.slotId,
    courtId: court.id,
    courtName: court.name,
    startTime: toHHmm(slot.startTime),
    endTime: toHHmm(slot.endTime),
    price: slot.price,
    date,
  };
}

function holdToSelected(hold: ActiveHold): SelectedSlot[] {
  return hold.slots.map((slot) => ({
    slotId: slot.slotId,
    courtId: hold.courtId,
    courtName: hold.courtName,
    startTime: slot.startTime,
    endTime: slot.endTime,
    price: slot.price,
    date: hold.date,
  }));
}

function getScheduleStartTimes(schedules: Record<number, CourtSlot[]>) {
  return Array.from(new Set(
    Object.values(schedules)
      .flat()
      .map((slot) => toHHmm(slot.startTime)),
  )).sort((a, b) => toMinutes(a) - toMinutes(b));
}
