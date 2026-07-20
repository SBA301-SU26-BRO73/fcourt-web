import { ArrowLeft, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ProgressStepper } from '../../components/ProgressStepper';
import { QRPaymentCard } from '../../components/QRPaymentCard';
import { UploadReceipt } from '../../components/UploadReceipt';
import { BookingSummary } from '../../components/BookingSummary';
import { getBookingDetails } from '@/services/booking/booking.api';
import type { CreateBookingsResponse } from '@/types/booking';
import type { Voucher } from '@/types/voucher';

interface LocationState {
  booking?: CreateBookingsResponse;
}

export function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get('bookingId');

  const [bookingData, setBookingData] = useState<CreateBookingsResponse | null>(() => {
    return (location.state as LocationState | null)?.booking ?? null;
  });
  const [loading, setLoading] = useState(!bookingData && !!bookingIdParam);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingData) return;

    if (bookingIdParam) {
      const bId = parseInt(bookingIdParam, 10);
      if (isNaN(bId)) {
        setError('Mã đặt sân không hợp lệ.');
        setLoading(false);
        return;
      }

      setLoading(true);
      getBookingDetails(bId)
        .then((fetchedBooking) => {
          const mapped: CreateBookingsResponse = {
            branchId: fetchedBooking.branchId,
            branchName: fetchedBooking.branchName,
            branchAddress: fetchedBooking.branchAddress,
            bankAccountNumber: fetchedBooking.bankAccountNumber,
            bankAccountName: fetchedBooking.bankAccountName,
            bankName: fetchedBooking.bankName,
            bankQrImageUrl: fetchedBooking.bankQrImageUrl,
            totalAmount: fetchedBooking.totalPrice,
            bookings: [fetchedBooking],
          };
          setBookingData(mapped);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('Không thể tải thông tin đặt sân. Lịch đặt sân có thể đã hết hạn hoặc không tồn tại.');
          setLoading(false);
        });
    }
  }, [bookingIdParam, bookingData]);

  // Manage countdown timer
  const expiredAt = bookingData?.bookings?.[0]?.expiredAt;
  const [timeLeft, setTimeLeft] = useState(() => {
    if (expiredAt) {
      const difference = +new Date(expiredAt) - +new Date();
      return difference > 0 ? Math.floor(difference / 1000) : 0;
    }
    return 300; // default 5 minutes
  });

  useEffect(() => {
    if (!expiredAt) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(expiredAt) - +new Date();
      return difference > 0 ? Math.floor(difference / 1000) : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [expiredAt]);

  const isExpired = timeLeft <= 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Đang tải thông tin đặt sân...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center shadow-sm">
          <h1 className="text-xl font-bold text-foreground mb-2">Chưa có booking để thanh toán</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {error || 'Vui lòng chọn slot và tạo booking trước khi vào trang thanh toán.'}
          </p>
          <button
            onClick={() => navigate('/slot-booking')}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold"
          >
            Chọn sân
          </button>
        </div>
      </div>
    );
  }

  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const handleVoucherChange = (voucher: Voucher | null, discount: number) => {
    setAppliedVoucher(voucher);
    setDiscountAmount(discount);
  };

  const paymentCode = `BOOK-${bookingData.bookings.map((booking) => booking.id).join('-')}`;
  const guestPhone = bookingData.bookings.find((booking) => booking.guestPhone)?.guestPhone ?? null;
  const finalAmount = Math.max(0, bookingData.totalAmount - discountAmount);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-foreground">
              Thanh toán đặt sân
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-2">
          <h1 className="text-xl font-bold text-foreground">Hoàn tất đặt sân</h1>
          <p className="text-xs text-muted-foreground">
            Thanh toán qua QR để hoàn tất đặt sân
          </p>
        </div>

        <ProgressStepper currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <QRPaymentCard
              branchName={bookingData.branchName}
              bankName={bookingData.bankName}
              bankAccountNumber={bookingData.bankAccountNumber}
              bankAccountName={bookingData.bankAccountName}
              bankQrImageUrl={bookingData.bankQrImageUrl}
              amount={finalAmount}
              content={paymentCode}
              timeLeft={timeLeft}
            />
            <UploadReceipt
              bookingData={bookingData}
              paymentCode={paymentCode}
              isExpired={isExpired}
              discount={discountAmount}
              voucherCode={appliedVoucher?.code}
            />
          </div>
          <div className="lg:col-span-1">
            <BookingSummary
              data={bookingData}
              guestPhone={guestPhone}
              paymentCode={paymentCode}
              onVoucherChange={handleVoucherChange}
            />
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
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
