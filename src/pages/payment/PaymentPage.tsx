import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { QRPaymentCard } from '../../components/QRPaymentCard';
import { UploadReceipt } from '../../components/UploadReceipt';
import { BookingSummary } from '../../components/BookingSummary';
import { VoucherApplyBox } from '../../components/VoucherApplyBox';
import { PaymentLoading, PaymentMessage } from './payment-state-card';
import {
  buildVietQrUrl,
  CHECKOUT_FAILURE_MESSAGE,
  classifyCheckoutError,
  isFreeCheckout,
  loginPathFor,
  parsePositiveInt,
  resolveHoldCheckoutStage,
} from './payment.utils';
import { getApiErrorMessage, toastApiError } from '@/common/utils/api-error';
import { useAuth } from '@/hooks/use-auth-context';
import { useCountdown } from '@/hooks/use-countdown';
import {
  useBookingDetail,
  useCheckoutInfo,
  useConfirmFree,
  useCreateBooking,
  useUploadReceipt,
} from '@/hooks/use-customer-checkout';
import { newIdempotencyKey } from '@/services/booking/booking.api';
import { releaseHold } from '@/services/hold/hold.api';
import { formatCountdown } from '@/utils/hold-countdown';
import { saveGuestBookingToken, loadGuestBookingToken } from '@/utils/guest-booking-storage';
import { clearActiveHold, loadActiveHold, withIdempotencyKey } from '@/utils/hold-storage';

export function PaymentPage() {
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get('bookingId');
  const navigate = useNavigate();

  if (bookingIdParam !== null) {
    const bookingId = parsePositiveInt(bookingIdParam);
    if (bookingId === null) {
      return (
        <PaymentMessage
          title="Mã đặt sân không hợp lệ"
          message="Liên kết thanh toán không đúng. Vui lòng chọn lại khung giờ."
          actions={[{ label: 'Chọn sân', onClick: () => navigate('/slot-booking') }]}
        />
      );
    }
    return <CheckoutView key={bookingId} bookingId={bookingId} />;
  }

  return <HoldCheckout />;
}

/** /payment without a booking: turn the stored hold into a booking, signed in or as a guest (hold token + phone, no account). */
function HoldCheckout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hold] = useState(() => loadActiveHold());
  const { isExpired } = useCountdown(hold?.expiresAt ?? null);
  const createBooking = useCreateBooking();
  const startedRef = useRef(false);

  const stage = resolveHoldCheckoutStage({
    hasHold: hold !== null,
    expired: isExpired,
    role: user?.role ?? null,
    createFailed: createBooking.isError,
  });

  const submit = () => {
    if (!hold) return;
    // The key is stored with the hold, so a retry or a reload replays the same booking.
    const keyed = withIdempotencyKey(hold, newIdempotencyKey);
    // mutateAsync, not mutate(..., { onSuccess }): under StrictMode the effect runs during the first
    // mount and per-call callbacks are dropped on the remount, which left the page stuck on "creating".
    // Failures surface through createBooking.isError.
    createBooking
      .mutateAsync({
        payload: { holdToken: keyed.holdToken, courtId: keyed.courtId, date: keyed.date, slotIds: keyed.slots.map((slot) => slot.slotId) },
        idempotencyKey: keyed.idempotencyKey as string,
      })
      .then((booking) => {
        // A guest has no JWT: the hold token stays the credential of this booking's checkout.
        if (!user) saveGuestBookingToken(booking.id, keyed.holdToken);
        clearActiveHold();
        navigate(`/payment?bookingId=${booking.id}`, { replace: true });
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    if (stage !== 'creating' || startedRef.current) return;
    startedRef.current = true;
    submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per mount
  }, [stage]);

  const chooseAgain = () => {
    if (hold) void releaseHold(hold.holdToken).catch(() => undefined);
    clearActiveHold();
    navigate('/slot-booking');
  };

  switch (stage) {
    case 'empty':
      return (
        <PaymentMessage
          title="Chưa có booking để thanh toán"
          message="Vui lòng chọn slot và giữ chỗ trước khi vào trang thanh toán."
          actions={[{ label: 'Chọn sân', onClick: () => navigate('/slot-booking') }]}
        />
      );
    case 'expired':
      return (
        <PaymentMessage
          title="Đã hết thời gian giữ chỗ"
          message="Khung giờ đã được mở lại cho mọi người. Vui lòng chọn lại."
          actions={[{ label: 'Chọn lại khung giờ', onClick: () => { clearActiveHold(); navigate('/slot-booking'); } }]}
        />
      );
    case 'wrong-role':
      return (
        <PaymentMessage
          title="Tài khoản không thể đặt sân"
          message="Chỉ tài khoản khách hàng mới đặt sân trực tuyến được. Vui lòng đăng nhập bằng tài khoản khách hàng."
          actions={[
            { label: 'Đăng nhập tài khoản khách hàng', onClick: () => navigate(loginPathFor('/payment')) },
            { label: 'Hủy giữ chỗ', onClick: chooseAgain, primary: false },
          ]}
        />
      );
    case 'error':
      return (
        <PaymentMessage
          title="Không thể tạo đơn đặt sân"
          message={getApiErrorMessage(createBooking.error, 'Vui lòng thử lại.')}
          actions={[
            { label: 'Thử lại', onClick: submit, disabled: createBooking.isPending },
            { label: 'Chọn lại khung giờ', onClick: chooseAgain, primary: false },
          ]}
        />
      );
    default:
      return <PaymentLoading label="Đang tạo đơn đặt sân..." />;
  }
}

function CheckoutView({ bookingId }: { bookingId: number }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Set only for a guest booking; a signed-in customer is identified by the JWT.
  const [holdToken] = useState(() => loadGuestBookingToken(bookingId));
  const bookingQuery = useBookingDetail(bookingId, { holdToken });
  const infoQuery = useCheckoutInfo(bookingId, holdToken);
  const upload = useUploadReceipt(bookingId, holdToken);
  const confirmFree = useConfirmFree(bookingId);

  const booking = bookingQuery.data;
  const info = infoQuery.data;
  const { remaining, isExpired } = useCountdown(info ? Date.parse(info.expiresAt) : null);

  // A booking that is no longer waiting for payment belongs on the confirmation screen.
  const alreadyPaid = booking && booking.status !== 'PENDING_PAYMENT' && booking.status !== 'CANCELLED';
  const failure = infoQuery.error ? classifyCheckoutError(infoQuery.error) : bookingQuery.error ? classifyCheckoutError(bookingQuery.error) : null;

  useEffect(() => {
    if (alreadyPaid || failure === 'not-awaiting-payment') {
      navigate(`/confirmation?bookingId=${bookingId}`, { replace: true });
    }
  }, [alreadyPaid, failure, bookingId, navigate]);

  if (alreadyPaid || failure === 'not-awaiting-payment') return <PaymentLoading label="Đang chuyển đến trạng thái thanh toán..." />;

  if (failure || booking?.status === 'CANCELLED') {
    const kind = failure ?? 'expired';
    return (
      <PaymentMessage
        title={kind === 'expired' ? 'Phiên thanh toán đã hết hạn' : 'Không thể tải đơn đặt sân'}
        message={CHECKOUT_FAILURE_MESSAGE[kind]}
        actions={[
          ...(kind === 'network' || kind === 'other'
            ? [{ label: 'Thử lại', onClick: () => { void bookingQuery.refetch(); void infoQuery.refetch(); } }]
            : []),
          { label: 'Chọn sân', onClick: () => navigate('/slot-booking'), primary: kind !== 'network' && kind !== 'other' },
        ]}
      />
    );
  }

  if (!booking || !info) return <PaymentLoading label="Đang tải thông tin đặt sân..." />;

  const isFree = isFreeCheckout(info);

  const handleUploaded = (file: { name: string; size: number; previewUrl: string }) => {
    toast.success('Đã gửi biên lai. Vui lòng chờ xác nhận.');
    navigate(`/confirmation?bookingId=${bookingId}`, { replace: true, state: { file } });
  };

  const handleConfirmFree = async () => {
    try {
      await confirmFree.mutateAsync();
      navigate(`/confirmation?bookingId=${bookingId}`, { replace: true, state: { free: true } });
    } catch (error) {
      toastApiError(error, 'Không thể xác nhận đơn miễn phí.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5faf6] text-[#191c1d]" style={{ zoom: 0.9 }}>
      <main className="mx-auto max-w-[1320px] px-4 py-8 md:px-8 md:py-10">
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-[#191c1d]">Hoàn tất thanh toán</h1>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(340px,0.82fr)]">
          <div>
            {isFree ? (
              <FreeBookingCard
                timeLeft={remaining}
                expired={isExpired}
                busy={confirmFree.isPending}
                onConfirm={handleConfirmFree}
              />
            ) : (
              <QRPaymentCard
                branchName={info.branchName}
                bankName={info.bankName}
                bankAccountNumber={info.bankAccountNumber}
                bankAccountName={info.bankAccountName}
                bankQrImageUrl={buildVietQrUrl(info)}
                amount={info.amount}
                content={info.transferContent}
                timeLeft={remaining}
                expired={isExpired}
              />
            )}
          </div>
          <div>
            <BookingSummary booking={booking} paymentCode={info.transferContent} payableAmount={info.amount}>
              {user?.role === 'CUSTOMER' ? <VoucherApplyBox booking={booking} disabled={isExpired} /> : null}
            </BookingSummary>
            {!isFree && (
              <UploadReceipt
                isExpired={isExpired}
                onSubmit={(file) => upload.mutateAsync(file)}
                onUploaded={handleUploaded}
              />
            )}
          </div>
        </div>

        <div className="mt-7 text-center">
          <p className="text-xs text-[#667267]">
            Bằng việc thanh toán, bạn đồng ý với{' '}
            <a href="#" className="text-primary hover:underline">
              Điều khoản dịch vụ
            </a>{' '}
            và{' '}
            <a href="#" className="text-primary hover:underline">
              Chính sách bảo mật
            </a>{' '}
            của SportCourt
          </p>
        </div>
      </main>
    </div>
  );
}

interface FreeBookingCardProps {
  timeLeft: number;
  expired: boolean;
  busy: boolean;
  onConfirm: () => void;
}

/** Voucher brought the total to 0 VND: no transfer, one confirmation (POST confirm-free). */
export function FreeBookingCard({ timeLeft, expired, busy, onConfirm }: FreeBookingCardProps) {
  return (
    <section className="rounded-3xl border border-[#d8e8dc] bg-white p-6 shadow-[0_10px_35px_rgba(46,125,50,0.08)] md:p-8">
      <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#2e7d32]">Đơn miễn phí</div>
      <h2 className="text-2xl font-bold tracking-tight text-[#191c1d]">Không cần chuyển khoản</h2>
      <p className="mt-2 text-sm text-[#667267]">
        Voucher đã giảm toàn bộ tiền sân. Xác nhận để giữ khung giờ của bạn.
      </p>
      <div className="mt-4 text-sm font-bold tabular-nums text-[#b7433d]" role="timer">
        Còn lại {formatCountdown(timeLeft)}
      </div>
      <button
        type="button"
        disabled={busy || expired}
        onClick={onConfirm}
        className="mt-6 w-full rounded-xl bg-[#2e7d32] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#256b29] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? 'Đang xác nhận...' : 'Xác nhận đặt sân miễn phí'}
      </button>
    </section>
  );
}
